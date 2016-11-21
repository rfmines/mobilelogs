var eventTypeDict = {
    0: 'SYSTEM',
    1: 'UI',
    2: 'SIP',
    3: 'RUNTIME',
    4: 'HM',
    5: 'CALL',
    10: 'UNDEFINED'
};

var eventNameDict = {
    0: 'APP_START',
    1: 'APP_BG',
    2: 'APP_FG',
    3: 'APP_INACTIVE',
    4: 'APP_ACTIVE',
    5: 'APP_LMEM',
    6: 'APP_RNOTIFY',
    7: 'APP_LNOTIFY',
    8: 'APP_CRASH',
    9: 'NET_CHANGE',
    10: 'APP_KEEPALIVE',
    11: 'APP_AUDIO_INT_START',
    12: 'APP_AUDIO_INT_STOP',
    13: 'APP_STOP',
    14: 'APP_SIZE',
    15: 'DEVICE_SETTINGS_CHANGED',

    10000: 'UI_VIEW',
    10001: 'UI_EVENT',
    10002: 'UI_ALERT',

    20000: 'SIP_INIT',
    20001: 'SIP_DESTROY',
    20002: 'SIP_REG_STATE',
    20003: 'SIP_CALL_STATE',
    20004: 'SIP_MEDIA_STATE',
    20005: 'SIP_TRANSPORT_STATE',
    20006: 'SIP_ERROR',

    30000: 'RT_WEB_REQUEST',
    30001: 'RT_WEB_RESPONSE',
    30002: 'RT_WARNING',
    30003: 'RT_LOGIN_START',
    30004: 'RT_LOGIN_RESULT',
    30005: 'RT_SIP_REG_START',
    30006: 'RT_SIP_REG_RESULT',
    30007: 'RT_OCALL_START',
    30008: 'RT_ICALL_START',
    30009: 'RT_CALL_ANSWER',
    30010: 'RT_CALL_END',
    30011: 'RT_BATTERY_LVL',
    30012: 'RT_ERROR',
    30013: 'RT_CHANGE_SERVER_ADDRESS',
    30014: 'RT_FIVE_UNSUCCESSFUL_LOGIN_ATTEMPTS',

    // Home Monitoring events
    40000: 'RT_PAIRING_MODE',
    40001: 'RT_DEVICE_PAIRED',
    40002: 'RT_DEVICE_UNPAIRED',
    40003: 'RT_DEVICE_UPDATED',
    40004: 'RT_MODE_CREATED',
    40005: 'RT_MODE_UPDATED',
    40006: 'RT_MODE_DELETED',
    40007: 'RT_OR_REQUEST',
    40008: 'RT_OR_FOUND',
    40009: 'RT_OR_CONNECTION',
    40010: 'RT_HMS_EVENT',

    // New Call event group
    50000: 'MEDIA_STATE', //call_id
    50001: 'CALL_STATE', //call_id
    50002: 'CALL_START', //call_id call_type
    50003: 'CALL_ANSWER', //call_id
    50004: 'CALL_END', //call_id call_direction call_duration remote_number
    50005: 'INVITE', //call_id
    50006: 'RED_ACTIVATED', //call_id
    50007: 'RED_LEVEL_CHANGED', //call_id
    50008: 'RED_DEACTIVATED', //call_id
    50009: 'USER_CALL_QUALITY',
    50010: 'BAD_AUDIO_DETECTION',
    50011: 'USER_RATING',
    50012: 'CALL_DECLINED',
    50013: 'CALL_MISSED',
    50014: 'CODEC_DETAILS',

    99999: 'Undefined'
};

var labelDic = {
    0: {name: 'network_status', type: 'string', measurement: 'not acceptable'},
    1: {name: 'free_memory', type: 'double', measurement: 'Megabytes'},
    2: {name: 'allocated_memory', type: 'double', measurement: 'Megabytes'},
    3: {name: 'remote_notification_text', type: 'string', measurement: 'not acceptable'},
    4: {name: 'local_notification_text', type: 'string', measurement: 'not acceptable'},
    5: {name: 'crash_name', type: 'string', measurement: 'not acceptable'},
    6: {name: 'crash_reason', type: 'string', measurement: 'not acceptable'},
    7: {name: 'crash_data', type: 'string', measurement: 'not acceptable'},
    8: {name: 'old_network_status', type: 'int', measurement: 'not acceptable'},
    9: {name: 'new_network_status', type: 'int', measurement: 'not acceptable'},
    10: {name: 'screen_name', type: 'string', measurement: 'not acceptable'},
    11: {name: 'control_name', type: 'string', measurement: 'not acceptable'},
    12: {name: 'alert_title', type: 'string', measurement: 'not acceptable'},
    13: {name: 'alert_text', type: 'string', measurement: 'not acceptable'},
    14: {name: 'sip_initialization_result', type: 'int', measurement: 'not acceptable'},
    15: {name: 'sip_deinitialization_result', type: 'int', measurement: 'not acceptable'},
    16: {name: 'sip_registration_status', type: 'int', measurement: 'not acceptable'},
    17: {name: 'error_code', type: 'int', measurement: 'not acceptable'},
    18: {name: 'sip_call_status', type: 'string', measurement: 'not acceptable'},
    19: {name: 'remote_number', type: 'string', measurement: 'not acceptable'},
    20: {name: 'anonymous_call', type: 'boolean', measurement: 'not acceptable'},
    21: {name: 'media_state', type: 'int', measurement: 'not acceptable'},
    22: {name: 'media_type', type: 'int', measurement: 'not acceptable'},
    23: {name: 'media_codec_info', type: 'string', measurement: 'not acceptable'},
    24: {name: 'transport_state', type: 'int', measurement: 'not acceptable'},
    25: {name: 'transport_status', type: 'int', measurement: 'not acceptable'},
    26: {name: 'transport_hostname', type: 'string', measurement: 'not acceptable'},
    27: {name: 'api_server', type: 'string', measurement: 'not acceptable'},
    28: {name: 'api_path', type: 'string', measurement: 'not acceptable'},
    29: {name: 'request_type', type: 'string', measurement: 'not acceptable'},
    30: {name: 'request_data', type: 'string', measurement: 'not acceptable'},
    31: {name: 'response_error', type: 'string', measurement: 'not acceptable'},
    32: {name: 'response_data', type: 'string', measurement: 'not acceptable'},
    33: {name: 'warning_message', type: 'string', measurement: 'not acceptable'},
    34: {name: 'login_result', type: 'string', measurement: 'not acceptable'},
    35: {name: 'sip_registration_result', type: 'string', measurement: 'not acceptable'},
    36: {name: 'media_packet_loss', type: 'double', measurement: 'percents'},
    37: {name: 'media_packet_reorder', type: 'double', measurement: 'percents'},
    38: {name: 'media_packet_discarded', type: 'double', measurement: 'percents'},
    39: {name: 'media_packet_duplicated', type: 'double', measurement: 'percents'},
    40: {name: 'current_battery_level', type: 'double', measurement: 'percents'},
    41: {name: 'error_message', type: 'string', measurement: 'not acceptable'},
    42: {name: 'parameter_info', type: 'string', measurement: 'not acceptable'},
    43: {name: 'call_duration', type: 'int', measurement: 'seconds'},
    44: {name: 'call_end_status', type: 'int', measurement: 'not acceptable'},
    45: {name: 'call_direction', type: 'int', measurement: 'not acceptable'},
    46: {name: 'call_id', type: 'string', measurement: 'not acceptable'},
    47: {name: 'call_end_information', type: 'string', measurement: 'not acceptable'},
    48: {name: 'server_address', type: 'string', measurement: 'not acceptable'},
    49: {name: 'server_type', type: 'int', measurement: 'not acceptable'},
    50: {name: 'ip_is_hardcoded', type: 'int', measurement: 'not acceptable'},
    51: {name: 'app_size', type: 'double', measurement: 'Megabytes'},
    52: {name: 'carrier_name', type: 'string', measurement: 'not acceptable'},
    53: {name: 'calling_mode', type: 'string', measurement: 'not acceptable'},
    54: {name: 'codec_name', type: 'string', measurement: 'not acceptable'},
    55: {name: 'voice_activity_detector', type: 'boolean', measurement: 'not acceptable'},
    56: {name: 'sample_rate', type: 'int', measurement: 'not acceptable'},
    57: {name: 'bit_rate', type: 'int', measurement: 'not acceptable'},
    58: {name: 'complexity', type: 'int', measurement: 'not acceptable'},
    59: {name: 'constant_bit_rate', type: 'boolean', measurement: 'not acceptable'},
    // New CALL event lables
    60: {name: 'rtp_sock_addr', type: 'string', measurement: 'not acceptable'},
    61: {name: 'rtcp_sock_addr', type: 'string', measurement: 'not acceptable'},
    62: {name: 'call_type', type: 'int', measurement: 'not acceptable'},
    63: {name: 'tx_media_packet_loss', type: 'double', measurement: 'percents'},
    64: {name: 'tx_media_packet_reorder', type: 'double', measurement: 'percents'},
    65: {name: 'tx_media_packet_discarded', type: 'double', measurement: 'percents'},
    66: {name: 'tx_media_packet_duplicated', type: 'double', measurement: 'percents'},
    67: {name: 'rtt_mean', type: 'double', measurement: 'mSec'},
    68: {name: 'rtt_max', type: 'double', measurement: 'mSec'},
    69: {name: 'rtt_last', type: 'double', measurement: 'mSec'},
    70: {name: 'rx_pkt', type: 'int', measurement: 'not acceptable'},
    71: {name: 'rx_lost', type: 'int', measurement: 'not acceptable'},
    72: {name: 'rx_bytes', type: 'int', measurement: 'kBytes'},
    73: {name: 'rx_bytes_ip', type: 'int', measurement: 'kBytes'},
    74: {name: 'rx_bandwidth_avg', type: 'double', measurement: 'bps'},
    75: {name: 'rx_bandwidth_avg_ip', type: 'double', measurement: 'bps'},
    76: {name: 'tx_pkt', type: 'int', measurement: 'not acceptable'},
    77: {name: 'tx_loss', type: 'int', measurement: 'not acceptable'},
    78: {name: 'tx_bytes', type: 'int', measurement: 'not acceptable'},
    79: {name: 'tx_bytes_ip', type: 'int', measurement: 'not acceptable'},
    80: {name: 'tx_bandwidth_avg', type: 'double', measurement: 'not acceptable'},
    81: {name: 'tx_bandwidth_avg_ip', type: 'double', measurement: 'not acceptable'},
    82: {name: 'rtp_session_length', type: 'double', measurement: 'seconds'},
    83: {name: 'sip_login', type: 'string', measurement: 'not acceptable'},
    84: {name: 'invite', type: 'string', measurement: 'not acceptable'},
    85: {name: 'min_level', type: 'int', measurement: 'not acceptable'},
    86: {name: 'i_old_level', type: 'int', measurement: 'not acceptable'},
    87: {name: 'i_new_level', type: 'int', measurement: 'not acceptable'},
    88: {name: 'i_packet_loss', type: 'double', measurement: 'percents'},
    89: {name: 'o_old_level', type: 'int', measurement: 'not acceptable'},
    90: {name: 'o_new_level', type: 'int', measurement: 'not acceptable'},
    91: {name: 'o_packet_loss', type: 'double', measurement: 'percents'},
    92: {name: 'i_level', type: 'int', measurement: 'not acceptable'},
    93: {name: 'o_level', type: 'int', measurement: 'not acceptable'},
    94: {name: 'packet_loss', type: 'string', measurement: 'percents'},
    95: {name: 'delay_jitter', type: 'int', measurement: 'not acceptable'},
    96: {name: 'echo', type: 'int', measurement: 'not acceptable'},
    97: {name: 'crackling', type: 'int', measurement: 'not acceptable'},
    98: {name: 'garbled', type: 'int', measurement: 'not acceptable'},
    99: {name: 'muffled', type: 'int', measurement: 'not acceptable'},
    100: {name: 'volume', type: 'int', measurement: 'not acceptable'},
    101: {name: 'stretch_voice', type: 'int', measurement: 'not acceptable'},
    102: {name: 'voice_path', type: 'int', measurement: 'not acceptable'},
    103: {name: 'comment', type: 'string', measurement: 'not acceptable'},
    104: {name: 'root_status', type: 'string', measurement: 'not acceptable'},
    105: {name: 'crash_id', type: 'string', measurement: 'not acceptable'},
    106: {name: 'crash_time', type: 'string', measurement: 'not acceptable'},
    107: {name: 'is_app_kill', type: 'string', measurement: 'not acceptable'},
    108: {name: 'user_route', type: 'string', measurement: 'not acceptable'},
    109: {name: 'latitude', type: 'string', measurement: 'not acceptable'},
    110: {name: 'longitude', type: 'string', measurement: 'not acceptable'},
    111: {name: 'timestamp', type: 'string', measurement: 'not acceptable'},
    112: {name: 'motion', type: 'string', measurement: 'not acceptable'},
    113: {name: 'read_phone_state', type: 'string', measurement: 'not acceptable'},
    114: {name: 'access_coarse_location', type: 'string', measurement: 'not acceptable'},
    115: {name: 'record_audio', type: 'string', measurement: 'not acceptable'},
    116: {name: 'read_contacts', type: 'string', measurement: 'not acceptable'},
    117: {name: 'write_external_storage', type: 'string', measurement: 'not acceptable'},
    118: {name: 'activity_recognition', type: 'string', measurement: 'not acceptable'},
    119: {name: 'access_fine_location', type: 'string', measurement: 'not acceptable'},
    120: {name: 'notification_setting', type: 'string', measurement: 'not acceptable'},
    121: {name: 'location_setting', type: 'string', measurement: 'not acceptable'},
    122: {name: 'user_rating', type: 'string', measurement: 'not acceptable'},
    123: {name: 'call_record_file', type: 'string', measurement: 'not acceptable'},
    124: {name: 'remote_notify_type', type: 'string', measurement: 'not acceptable'},
    125: {name: 'local_number', type: 'string', measurement: 'not acceptable'},
    126: {name: 'remote_notification_data_associated', type: 'string', measurement: 'not acceptable'},
    127: {name: 'error_type', type: 'string', measurement: 'not acceptable'},
    128: {name: 'code', type: 'string', measurement: 'not acceptable'},
    129: {name: 'server_ip', type: 'string', measurement: 'not acceptable'},
    130: {name: 'port', type: 'string', measurement: 'not acceptable'},
    131: {name: 'error_info', type: 'string', measurement: 'not acceptable'},
    // HM labels
    1000: {name: 'Enabled', type: 'string', measurement: 'not acceptable'},
    1001: {name: 'UsingOR', type: 'string', measurement: 'not acceptable'},
    1002: {name: 'DeviceId', type: 'string', measurement: 'not acceptable'},
    1003: {name: 'DeviceType', type: 'string', measurement: 'not acceptable'},
    1004: {name: 'Name', type: 'string', measurement: 'not acceptable'},
    1005: {name: 'Param', type: 'string', measurement: 'not acceptable'},
    1006: {name: 'Value', type: 'string', measurement: 'not acceptable'},
    1007: {name: 'ModeId', type: 'string', measurement: 'not acceptable'},
    1008: {name: 'ModeName', type: 'string', measurement: 'not acceptable'},
    1009: {name: 'Name', type: 'string', measurement: 'not acceptable'},
    1010: {name: 'Schedule', type: 'string', measurement: 'not acceptable'},
    1011: {name: 'RequestORController', type: 'string', measurement: 'not acceptable'},
    1012: {name: 'RequestType', type: 'string', measurement: 'not acceptable'},
    1013: {name: 'RequestData', type: 'string', measurement: 'not acceptable'},
    1014: {name: 'ControllerIP', type: 'string', measurement: 'not acceptable'},
    1015: {name: 'Connected', type: 'string', measurement: 'not acceptable'},
    1016: {name: 'EventType', type: 'string', measurement: 'not acceptable'},
    1017: {name: 'PayLoad', type: 'string', measurement: 'not acceptable'},

    999: {name: 'Undefined', type: 'string', measurement: 'not acceptable'}
};

var valueDic = {
    0: {
        '0': 'Not Reachable',
        '1': 'Reachable Wifi',
        '2': 'Reachable Cellular',
        '4': 'ReachableIPv6',
        '5': 'ReachableIPv6WiFi',
        '6': 'ReachableIPv6Cellular'
    },//'Network status',
    1: undefined,//'Free memory',
    2: undefined,//'Allocated memory',
    3: undefined,//'Remote notification text',
    4: undefined,//'Local notification text',
    5: undefined,//'Crash name',
    6: undefined,//'Crash reason',
    7: undefined,//'Crash data',
    8: {
        "0": "Not Reachable",
        "1": "Reachable Wifi",
        "2": "Reachable Cellular",
        "4": "ReachableIPv6",
        "5": "ReachableIPv6WiFi",
        "6": "ReachableIPv6Cellular"
    },//'Old network status',
    9: {
        "0": "Not Reachable",
        "1": "Reachable Wifi",
        "2": "Reachable Cellular",
        "4": "ReachableIPv6",
        "5": "ReachableIPv6WiFi",
        "6": "ReachableIPv6Cellular"
    },//'New network status',
    10: undefined,//'Screen name',
    11: undefined,//'Control name',
    12: undefined,//'Alert title',
    13: undefined,//'Alert text',
    14: undefined,//'SIP initialization result',
    15: undefined,//'SIP de-initialization result',
    16: {
        "-1": "Reg_Invalid",
        "0": "Reg_Unregistered",
        "1": "Reg_Registered",
        "2": "Reg_Registering",
        "3": "Reg_network_changed"
    },//'SIP registration status',
    17: undefined,//'Error code',
    18: {
        "-1": "call_Invalid",
        "0": "call_inprogress",
        "1": "call_earlymedia",
        "2": "call_connecting",
        "3": "call_connected",
        "4": "call_disconnected",
        "5": "call_disconnecting",
        "6": "call_incoming",
        "7": "call_decline",
        "8": "call_transfer_success",
        "9": "Call_transfer_failed"
    },//'SIP call status',
    19: undefined,//'Remote number',
    20: {"0": "No", "1": "Yes"},//'Anonymous call',
    21: {
        "0": "PJSUA_CALL_MEDIA_NONE", //Call currently has no media , or media is not used
        "1": "PJSUA_CALL_MEDIA_ACTIVE", //Call media is active
        "2": "PJSUA_CALL_MEDIA_LOCAL_HOLD", // THe media is currently put on hold by local endpoint
        "3": "PJSUA_CALL_MEDIA_REMOTE_HOLD", // THe media is currently put on hold by remote endpoint
        "4": "PJSUA_CALL_MEDIA_ERROR" // The media responed error
    },//'Media state',
    22: {
        "0": "PJMEDIA_TYPE_NONE",
        "1": "PJMEDIA_TYPE_AUDIO",
        "2": "PJMEDIA_TYPE_VIDEO",
        "3": "PJMEDIA_TYPE_APPLICATION",
        "4": "PJMEDIA_TYPE_UNKNOWN"
    },//'Media type',
    23: undefined,//'Media codec info',
    24: {
        "0": "PJSIP_TP_STATE_CONNECTED",
        "1": "PJSIP_TP_STATE_DISCONNECTED",
        "2": "PJSIP_TP_STATE_SHUTDOWN",
        "3": "PJSIP_TP_STATE_DESTROY"
    },//'Transport state',
    25: {
        "0": "PJ_SUCCESS",
        "171060": "PJSIP_EUNSUPTRANSPORT",
        "171061": "PJSIP_EPENDINGTX",
        "171062": "PJSIP_ERXOVERFLOW",
        "171063": "PJSIP_EBUFDESTROYED",
        "171064": "PJSIP_ETPNOTSUITABLE",
        "171065": "PJSIP_ETPNOTAVAIL"
    },//'Transport status',
    26: undefined,//'Transport hostname',
    27: undefined,//'API server',
    28: undefined,//'API path',
    29: undefined,//'Request type',
    30: undefined,//'Request data',
    31: undefined,//'Response error',
    32: undefined,//'Response data',
    33: undefined,//'Warning message',
    34: undefined,//'Login result',
    35: undefined,//'SIP registration result',
    36: undefined,//'Media packet loss',
    37: undefined,//'Media packet reorder',
    38: undefined,//'Media packet discarded',
    39: undefined,//'Media packet duplicated',
    40: undefined,//'Current battery level',
    41: undefined,//'Error message',
    42: undefined,//'Parameter Info',
    43: undefined,//'Call duration',
    44: {"0": "Normally", "1": "Abnormally"},//'Call end status',
    45: {"0": "Incoming", "1": "Outgoing"},//'Call direction',
    46: undefined,//'Call_id',
    47: undefined,//'Call end information',
    48: undefined,//'Address',
    49: {"0": "WEB_API_SERVER", "1": "SIP_SERVER"},//'Server type',
    52: undefined,//'Hardcoded_ip',
    51: undefined,//'Size',
    52: undefined,//'Carrier name',
    53: undefined,//'Calling mode',
    54: undefined,//'Codec Name',
    55: undefined,//'Voice Activity Detector',
    56: undefined,//'Sample Rate',
    57: undefined,//'Bit Rate',
    58: undefined,//'Complexity',
    59: undefined,//'Constant Bit Rate',
    // New CALL event lables
    60: undefined,//'RTP Sock Address',
    61: undefined,//'RTCP Sock Address',
    62: {"0": "Incoming", "1": "Outgoing"},//'Call type',
    63: undefined,//'Tx Media Packet Loss',
    64: undefined,//'Tx Media Packet Reorder',
    65: undefined,//'Tx Media Packet Discarded',
    66: undefined,//'Tx Media Packet Duplicated',
    67: undefined,//'rtt.mean',
    68: undefined,//'rtt.max',
    69: undefined,//'rtt.last',
    70: undefined,//'rx.pkt',
    71: undefined,//'rx.lost',
    72: undefined,//'rx.bytes',
    73: undefined,//'rx.bytes_IP',
    74: undefined,//'rx.bandwidth_avg',
    75: undefined,//'rx.bandwidth_avg_IP',
    76: undefined,//'tx.pkt',
    77: undefined,//'tx.loss',
    78: undefined,//'tx.bytes',
    79: undefined,//'tx.bytes_IP',
    80: undefined,//'tx.bandwidth_avg',
    81: undefined,//'tx_bandwidth_avg_IP',
    82: undefined,//'Rtp session length',
    83: undefined,//'SIP login',
    84: undefined,//'Invite',
    85: undefined,//'Min_level',
    86: undefined,//'I_old_level',
    87: undefined,//'I_new_level',
    88: undefined,//'I_packet_loss',
    89: undefined,//'O_old_level',
    90: undefined,//'O_new_level',
    91: undefined,//'O_packet_loss',
    92: undefined,//'I_level',
    93: undefined,//'O_level',
    94: undefined,//'packet_loss',
    95: undefined,//'delay_jitter',
    96: undefined,//'echo',
    97: undefined,//'crackling',
    98: undefined,//'garbled',
    99: undefined,//'muffled',
    100: undefined,//'volume',
    101: undefined,//'stretch_voice',
    102: {"0": "No_Way", "1": "One_Way", "2": "Both_Way"},//'voice_path',
    103: undefined,//'comment',
    104: {"0": "disabled", "1": "enabled"},//'root_status',
    105: undefined,//'crash_id',
    106: undefined,//'crash_time',
    107: undefined,//'Is_app_kill',
    108: undefined,//'User_route',
    109: undefined,//"latitude",
    110: undefined,//"longitude",
    111: undefined,//"timestamp",
    112: undefined,//"motion",
    113: undefined,//"read_phone_state",
    114: undefined,//"access_coarse_location",
    115: undefined,//"record_audio",
    116: undefined,//"read_contacts",
    117: undefined,//"write_external_storage",
    118: undefined,//"activity_recognition",
    119: undefined,//"access_fine_location",
    120: undefined,//"notification_setting",
    121: undefined,//"location_setting",
    122: undefined,//"user_rating",
    123: undefined,//"call_record_file",
    124: undefined,//"remote_notify_type",
    125: undefined,//"local_number",
    126: undefined,//"remote_notification_data_associated",
    127: undefined,//"error_type",
    128: undefined,//"code",
    129: undefined,//"server_ip",
    130: undefined,//"port",
    131: undefined,//"error_info",

    // Home Monitoring
    1000: undefined,
    1001: undefined,
    1002: undefined,
    1003: undefined,
    1004: undefined,
    1005: undefined,
    1006: undefined,
    1007: undefined,
    1008: undefined,
    1009: undefined,
    1010: undefined,
    1011: undefined,
    1012: undefined,
    1013: undefined,
    1014: undefined,
    1015: undefined,
    1016: undefined,
    1017: undefined,

    999: undefined //'Undefined'
};

function getKey(value, obj) {
    for (var key in obj) {
        if (obj[key] == value) {
            return key;
        }
    }
    return null;
};

function getEventNameAndType(inc_val) {

    var eventType = eventTypeDict[Math.round(inc_val / 10000)];
    if (eventType === undefined) {
        eventType = inc_val;
    }
    var eventName = eventNameDict[inc_val];
    if (eventName === undefined) {
        eventName = inc_val;
    }
    var result = [eventType, eventName];
    return result;
}

function getLabelName(labelid) {
    if (labelid === undefined || labelid === null) {
        labelid = 999;
    }
    var result = labelDic[labelid].name;
    if (result === undefined) {
        result = labelid;
    }
    return result;
};

function decodeEventValue(labelid, inc_value) {
    if (labelid === undefined) {
        labelid = 999;
    }
    if (inc_value === undefined) {
        inc_value = null;
    }
    // Special case for geolocation during the call ,
    // as a value we suspect an array , not an ordinary string
    if (labelid == 108) {
        var result = [];
        for (var arrayIterator in inc_value) {
            var route_obj = {};
            for (var objectIterator in inc_value[arrayIterator]) {
                // 111 subEvent is a timestamp date , that must be converted from unix string to Date object
                // without this in mongo we cant use date-based filters
                if (objectIterator != 111) {
                    route_obj[getLabelName(objectIterator)] = inc_value[arrayIterator][objectIterator];
                } else {
                    route_obj[getLabelName(objectIterator)] = new Date(inc_value[arrayIterator][objectIterator] * 1000);
                }

            }
            ;
            result.push(route_obj);
            route_obj = {};
        }
        return result;
    } else {
        var labelPossibleValues = valueDic[labelid];
        if (labelPossibleValues === undefined) {
            return inc_value;
        }
        else {
            var result = labelPossibleValues[inc_value]
            if (result === undefined) {
                result = inc_value;
            }
            return result;
        }
    }
}

function encodeEventType(eventName) {
    for (var keyIterator in eventNameDict) {
        if (eventNameDict[keyIterator] === eventName) {
            return keyIterator;
        }
    }
}

function encodeLabel(labelName) {
    for (keyIterator in labelDic) {
        if (labelDic[keyIterator].name === labelName) {
            return keyIterator;
        }
    }
}

function encodeValue(labelName, value) {
    var encodedValue = getKey(value, valueDic[encodeLabel(labelName)]);
    var encodeResult;
    if (encodedValue === null || encodedValue === undefined) {
        encodeResult = value;
    } else {
        encodeResult = encodedValue;
    }
    return encodeResult;

}

module.exports.getLabelName = getLabelName;
module.exports.getEventNameAndType = getEventNameAndType;
module.exports.decodeEventValue = decodeEventValue;

// These methods for testing purposes such as mocha tests implemented in ./test folder in the root of this project
module.exports.encodeEventType = encodeEventType;
module.exports.encodeLabel = encodeLabel;
module.exports.encodeValue = encodeValue;

module.exports.eventTypeDict = eventTypeDict;
module.exports.eventNameDict = eventNameDict;
module.exports.labelDic = labelDic;
module.exports.valueDic = valueDic;


