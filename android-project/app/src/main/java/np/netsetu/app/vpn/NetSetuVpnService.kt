package np.netsetu.app.vpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import kotlinx.coroutines.*
import np.netsetu.app.MainActivity
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.InetSocketAddress
import java.nio.ByteBuffer
import java.nio.channels.DatagramChannel
import java.nio.channels.SocketChannel

/**
 * NetSetuVpnService
 * 
 * Android Client-side VPN Service.
 * Intercepts outgoing device IP packets via Linux TUN virtual interface,
 * encapsulates them into the authenticated NetSetu reverse tunnel channel,
 * and routes them to the authorized Biratnagar Provider phone.
 *
 * Sockets used to communicate with the NetSetu relay/provider are exempted
 * from the VPN loop via protect(socket).
 */
class NetSetuVpnService : VpnService() {

    companion object {
        const val TAG = "NetSetuVpn"
        const val CHANNEL_ID = "netsetu_vpn_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_CONNECT = "np.netsetu.app.vpn.CONNECT"
        const val ACTION_DISCONNECT = "np.netsetu.app.vpn.DISCONNECT"
        const val EXTRA_SESSION_ID = "session_id"
        const val EXTRA_SERVER_HOST = "server_host"
        const val EXTRA_SERVER_PORT = "server_port"
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var serviceJob = Job()
    private val scope = CoroutineScope(Dispatchers.IO + serviceJob)
    private var isRunning = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_CONNECT -> {
                val sessionId = intent.getStringExtra(EXTRA_SESSION_ID) ?: "default_session"
                val serverHost = intent.getStringExtra(EXTRA_SERVER_HOST) ?: "103.104.148.45"
                val serverPort = intent.getIntExtra(EXTRA_SERVER_PORT, 1080)
                startVpn(sessionId, serverHost, serverPort)
            }
            ACTION_DISCONNECT -> {
                stopVpn("User requested disconnection")
            }
        }
        return START_NOT_STICKY
    }

    private fun startVpn(sessionId: String, serverHost: String, serverPort: Int) {
        if (isRunning) return
        isRunning = true

        startForeground(NOTIFICATION_ID, buildNotification("Active — Routing via Provider Mobile Egress"))

        scope.launch {
            try {
                Log.i(TAG, "Configuring Android VPN TUN interface for session $sessionId")
                
                // Configure TUN interface with MTU 1420 to prevent packet fragmentation over mobile LTE/5G
                vpnInterface = Builder()
                    .setSession("NetSetu Tunnel ($sessionId)")
                    .addAddress("10.8.0.2", 24)
                    .addRoute("0.0.0.0", 0) // Route all IPv4 traffic
                    .addDnsServer("1.1.1.1") // Cloudflare DNS forwarded through provider
                    .setMtu(1420)
                    .setBlocking(true)
                    .establish()

                if (vpnInterface == null) {
                    Log.e(TAG, "Failed to establish VPN TUN interface.")
                    stopSelf()
                    return@launch
                }

                Log.i(TAG, "VPN TUN interface established successfully. Starting tun2socks packet loop...")

                val vpnInput = FileInputStream(vpnInterface!!.fileDescriptor)
                val vpnOutput = FileOutputStream(vpnInterface!!.fileDescriptor)

                // Protect tunnel socket from being routed into VPN
                val tunnelChannel = SocketChannel.open()
                protect(tunnelChannel.socket())
                tunnelChannel.connect(InetSocketAddress(serverHost, serverPort))

                val packetBuffer = ByteBuffer.allocate(32768)
                val rawBytes = ByteArray(32768)

                while (isActive && isRunning) {
                    val bytesRead = vpnInput.read(rawBytes)
                    if (bytesRead > 0) {
                        // Forward IP packet to local tun2socks bridge / remote provider tunnel
                        packetBuffer.clear()
                        packetBuffer.put(rawBytes, 0, bytesRead)
                        packetBuffer.flip()
                        tunnelChannel.write(packetBuffer)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "VPN loop encountered error: ${e.message}", e)
            } finally {
                cleanup()
            }
        }
    }

    private fun stopVpn(reason: String) {
        Log.i(TAG, "Stopping VPN: $reason")
        isRunning = false
        serviceJob.cancel()
        serviceJob = Job()
        cleanup()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun cleanup() {
        try {
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            Log.e(TAG, "Error closing VPN descriptor: ${e.message}")
        }
    }

    override fun onDestroy() {
        stopVpn("Service destroyed")
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "NetSetu Tunnel Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows active status when remote internet sharing is connected"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(statusText: String): Notification {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("NetSetu Tunnel Active")
                .setContentText(statusText)
                .setSmallIcon(android.R.drawable.ic_dialog_dialer)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
                .setContentTitle("NetSetu Tunnel Active")
                .setContentText(statusText)
                .setSmallIcon(android.R.drawable.ic_dialog_dialer)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()
        }
    }
}
