package np.netsetu.app.net

import com.google.gson.annotations.SerializedName

data class TunnelMessage(
    @SerializedName("type") val type: String,
    @SerializedName("deviceId") val deviceId: String? = null,
    @SerializedName("sessionId") val sessionId: String? = null,
    @SerializedName("payload") val payload: Any? = null,
    @SerializedName("timestamp") val timestamp: Long = System.currentTimeMillis()
)

data class PairingRequestPayload(
    val providerDeviceId: String,
    val invitationId: String,
    val clientDeviceId: String,
    val clientDeviceName: String,
    val clientType: String
)

data class PairingDecisionPayload(
    val invitationId: String,
    val approved: Boolean,
    val clientDeviceId: String
)

data class TrafficStatsPayload(
    val sessionId: String,
    val bytesUpDelta: Long,
    val bytesDownDelta: Long
)

enum class NetSetuRole {
    PROVIDER,
    CLIENT
}
