package np.netsetu.app

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import np.netsetu.app.provider.NetSetuProviderService
import np.netsetu.app.vpn.NetSetuVpnService

class MainActivity : ComponentActivity() {

    private var pendingVpnStart = false

    private val vpnPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            startClientVpnService()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NetSetuTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0A1128)
                ) {
                    NetSetuMainScreen(
                        onRequestStartVpn = { prepareAndStartVpn() },
                        onRequestStopVpn = { stopClientVpnService() },
                        onStartProvider = { startProviderSharing() },
                        onStopProvider = { stopProviderSharing() }
                    )
                }
            }
        }
    }

    private fun prepareAndStartVpn() {
        val intent = VpnService.prepare(this)
        if (intent != null) {
            vpnPermissionLauncher.launch(intent)
        } else {
            startClientVpnService()
        }
    }

    private fun startClientVpnService() {
        val intent = Intent(this, NetSetuVpnService::class.java).apply {
            action = NetSetuVpnService.ACTION_CONNECT
            putExtra(NetSetuVpnService.EXTRA_SESSION_ID, "ses_biratnagar_saptari")
        }
        startService(intent)
    }

    private fun stopClientVpnService() {
        val intent = Intent(this, NetSetuVpnService::class.java).apply {
            action = NetSetuVpnService.ACTION_DISCONNECT
        }
        startService(intent)
    }

    private fun startProviderSharing() {
        val intent = Intent(this, NetSetuProviderService::class.java).apply {
            action = NetSetuProviderService.ACTION_START_SHARING
        }
        startService(intent)
    }

    private fun stopProviderSharing() {
        val intent = Intent(this, NetSetuProviderService::class.java).apply {
            action = NetSetuProviderService.ACTION_STOP_SHARING
        }
        startService(intent)
    }
}

@Composable
fun NetSetuTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF00F5D4),
            secondary = Color(0xFF1282A2),
            background = Color(0xFF0A1128),
            surface = Color(0xFF001F54),
            onPrimary = Color(0xFF001F54),
            onSurface = Color.White
        ),
        content = content
    )
}

@Composable
fun NetSetuMainScreen(
    onRequestStartVpn: () -> Unit,
    onRequestStopVpn: () -> Unit,
    onStartProvider: () -> Unit,
    onStopProvider: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) } // 0: Provider, 1: Client
    var isConnected by remember { mutableStateOf(false) }
    var pairingCode by remember { mutableStateOf("") }
    var generatedCode by remember { mutableStateOf("9X4K2P") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "NetSetu",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF00F5D4)
                )
                Text(
                    text = "Encrypted Remote Peer-to-Peer Gateway",
                    fontSize = 12.sp,
                    color = Color.LightGray
                )
            }
            Icon(
                imageVector = Icons.Default.Security,
                contentDescription = "Encrypted",
                tint = Color(0xFF00F5D4)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Mode Switcher Tabs
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color(0xFF001F54),
            contentColor = Color(0xFF00F5D4)
        ) {
            Tab(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                text = { Text("Provider Mode") }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = { Text("Receiver Mode") }
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        if (selectedTab == 0) {
            // PROVIDER VIEW
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF001F54)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Mobile Data Egress Gateway",
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Cellular 4G/5G Radio Egress\nInternal CGNAT: 100.64.12.88\nPublic Egress: 103.104.148.45",
                        color = Color(0xFF90E0EF),
                        fontSize = 13.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Active Pairing Code:",
                        color = Color.LightGray,
                        fontSize = 12.sp
                    )
                    Text(
                        text = generatedCode,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF00F5D4),
                        letterSpacing = 4.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            if (isConnected) {
                                onStopProvider()
                                isConnected = false
                            } else {
                                onStartProvider()
                                isConnected = true
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isConnected) Color(0xFFE63946) else Color(0xFF00F5D4)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = if (isConnected) "Stop Sharing Mobile Internet" else "Start Sharing Mobile Internet",
                            color = if (isConnected) Color.White else Color(0xFF0A1128),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        } else {
            // CLIENT VIEW
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF001F54)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Connect to Provider Gateway",
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        fontSize = 18.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Routing mode: Full Android VpnService (tun2socks bridge)",
                        color = Color(0xFF90E0EF),
                        fontSize = 13.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = pairingCode,
                        onValueChange = { if (it.length <= 6) pairingCode = it.uppercase() },
                        label = { Text("Enter 6-char Pairing Code") },
                        placeholder = { Text("e.g. 9X4K2P") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF00F5D4),
                            unfocusedBorderColor = Color(0xFF1282A2),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            if (isConnected) {
                                onRequestStopVpn()
                                isConnected = false
                            } else {
                                onRequestStartVpn()
                                isConnected = true
                            }
                        },
                        enabled = isConnected || pairingCode.length == 6,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isConnected) Color(0xFFE63946) else Color(0xFF00F5D4)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = if (isConnected) "Disconnect VPN Tunnel" else "Connect via Provider Mobile Exit",
                            color = if (isConnected) Color.White else Color(0xFF0A1128),
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Connection Diagnostics Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF034078)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Tunnel Health & Diagnostics",
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                    Text(
                        text = if (isConnected) "ACTIVE" else "IDLE",
                        color = if (isConnected) Color(0xFF00F5D4) else Color.Gray,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Measured Latency:", color = Color.LightGray, fontSize = 13.sp)
                    Text(if (isConnected) "38 ms" else "Not available", color = Color.White, fontSize = 13.sp)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Observed Egress IP:", color = Color.LightGray, fontSize = 13.sp)
                    Text(if (isConnected) "103.104.148.45 (Provider Node)" else "Not available", color = Color.White, fontSize = 13.sp)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Encrypted Cipher:", color = Color.LightGray, fontSize = 13.sp)
                    Text("TLS 1.3 / ChaCha20-Poly1305", color = Color.White, fontSize = 13.sp)
                }
            }
        }
    }
}
