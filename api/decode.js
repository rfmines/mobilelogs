/**
 * @brief Mobile Application logger - server side
 *
 *
 * @copyright Ooma Inc, 2015
 * @author: Dmitry Kudryavtsev
 */
var event_type_dict ={
    0:'SYSTEM',
    1:'UI',
    2:'SIP',
    3:'RUNTIME',
    4:'HM',
    10:'UNDEFINED'
};

var event_name_dict ={
    0:'APP_START',
    1:'APP_BG',
    2:'APP_FG',
    3:'APP_INACTIVE',
    4:'APP_ACTIVE',
    5:'APP_LMEM',
    6:'APP_RNOTIFY',
    7:'APP_LNOTIFY',
    8:'APP_CRASH',
    9:'NET_CHANGE',
    10:'APP_KEEPALIVE',
    11:'APP_AUDIO_INT_START',
    12:'APP_AUDIO_INT_STOP',
    13:'APP_STOP',
    14:'APP_SIZE',

    10000:'UI_VIEW',
    10001:'UI_EVENT',
    10002:'UI_ALERT',

    20000:'SIP_INIT',
    20001:'SIP_DESTROY',
    20002:'SIP_REG_STATE',
    20003:'SIP_CALL_STATE',
    20004:'SIP_MEDIA_STATE',
    20005:'SIP_TRANSPORT_STATE',

    30000:'RT_WEB_REQUEST',
    30001:'RT_WEB_RESPONSE',
    30002:'RT_WARNING',
    30003:'RT_LOGIN_START',
    30004:'RT_LOGIN_RESULT',
    30005:'RT_SIP_REG_START',
    30006:'RT_SIP_REG_RESULT',
    30007:'RT_OCALL_START',
    30008:'RT_ICALL_START',
    30009:'RT_CALL_ANSWER',
    30010:'RT_CALL_END',
    30011:'RT_BATTERY_LVL',
    30012:'RT_ERROR',
    30013:'RT_CHANGE_SERVER_ADDRESS',
    30014:'RT_FIVE_UNSUCCESSFUL_LOGIN_ATTEMPTS',
    30015:'RT_CODEC_DETAILS',

    // Home Monitoring events
	40000:'RT_PAIRING_MODE',
	40001:'RT_DEVICE_PAIRED',
	40002:'RT_DEVICE_UNPAIRED',
	40003:'RT_DEVICE_UPDATED',
	40004:'RT_MODE_CREATED',
	40005:'RT_MODE_UPDATED',
	40006:'RT_MODE_DELETED',
	40007:'RT_OR_REQUEST',
	40008:'RT_OR_FOUND',
	40009:'RT_OR_CONNECTION',
	40010:'RT_HMS_EVENT',

	99999: 'Undefined'
};
var labeldic ={
    0:'Network status',
    1:'Free memory',
    2:'Allocated memory',
    3:'Remote notification text',
    4:'Local notification text',
    5:'Crash name',
    6:'Crash reason',
    7:'Crash data',
    8:'Old network status',
    9:'New network status',
    10:'Screen name',
    11:'Control name',
    12:'Alert title',
    13:'Alert text',
    14:'SIP initialization result',
    15:'SIP de-initialization result',
    16:'SIP registration status',
    17:'Error code',
    18:'SIP call status',
    19:'Remote number',
    20:'Anonymous call',
    21:'Media state',
    22:'Media type',
    23:'Media codec info',
    24:'Transport state',
    25:'Transport status',
    26:'Transport hostname',
    27:'API server',
    28:'API path',
    29:'Request type',
    30:'Request data',
    31:'Response error',
    32:'Response data',
    33:'Warning message',
    34:'Login result',
    35:'SIP registration result',
    36:'Media packet loss',
    37:'Media packet reorder',
    38:'Media packet discarded',
    39:'Media packet duplicated',
    40:'Current battery level',
    41:'Error message',
    42:'Parameter Info',
    43:'Call duration',
    44:'Call end status',
    45:'Call direction',
    46:'Call_id',
    47:'Call end information',
    48:'Server Address',
    49:'Server type',
    50:'IpIsHardcoded',
    51:'AppSize',
    52:'Carrier name',
	53:'Calling mode',
    54:'Codec Name',
    55:'Voice Activity Detector',
    56:'Sample Rate',
    57:'Bit Rate',
    58:'Complexity',
    59:'Constant Bit Rate',
	// HM labels
	1000:'Enabled',
	1001:'UsingOR',
	1002:'DeviceId',
	1003:'DeviceType',
	1004:'Name',
	1005:'Param',
	1006:'Value',
	1007:'ModeId',
	1008:'ModeName',
	1009:'Name',
	1010:'Schedule',
	1011:'RequestORController',
	1012:'RequestType',
	1013:'RequestData',
	1014:'ControllerIP',
	1015:'Connected',
	1016:'EventType',
	1017:'PayLoad',

    999 :'Undefined'
};

var values_dic ={
    0: {"0":"Not Reachable",
        "1":"Reachable Wifi",
        "2":"Reachable Cellular",
        "4":"ReachableIPv6",
        "5":"ReachableIPv6WiFi",
        "6":"ReachableIPv6Cellular"},//'Network status',
    1: undefined,//'Free memory',
    2: undefined,//'Allocated memory',
    3: undefined,//'Remote notification text',
    4: undefined,//'Local notification text',
    5: undefined,//'Crash name',
    6: undefined,//'Crash reason',
    7: undefined,//'Crash data',
    8: {"0":"Not Reachable",
        "1":"Reachable Wifi",
        "2":"Reachable Cellular",
        "4":"ReachableIPv6",
        "5":"ReachableIPv6WiFi",
        "6":"ReachableIPv6Cellular"},//'Old network status',
    9: {"0":"Not Reachable",
        "1":"Reachable Wifi",
        "2":"Reachable Cellular",
        "4":"ReachableIPv6",
        "5":"ReachableIPv6WiFi",
        "6":"ReachableIPv6Cellular"},//'New network status',
    10: undefined,//'Screen name',
    11: undefined,//'Control name',
    12: undefined,//'Alert title',
    13: undefined,//'Alert text',
    14: undefined,//'SIP initialization result',
    15: undefined,//'SIP de-initialization result',
    16: {"-1":"Reg_Invalid",
        "0":"Reg_Unregistered",
        "1":"Reg_Registered",
        "2":"Reg_Registering",
        "3":"Reg_network_changed"},//'SIP registration status',
    17: undefined,//'Error code',
    18: {"-1":"Call_Invalid",
        "0":"Call_inprogress",
        "1":"Call_earlymedia",
        "2":"Call_connecting",
        "3":"Call_connected",
        "4":"Call_disconnected",
        "5":"Call_disconnecting",
        "6":"Call_incoming",
        "7":"Call_decline",
        "8":"Call_transfer_success",
        "9":"Call_transfer_decline"},//'SIP call status',
    19: undefined,//'Remote number',
    20: {"0":"No","1":"Yes"},//'Anonymous call',
    21: {
        "0":"PJSUA_CALL_MEDIA_NONE", //Call currently has no media , or media is not used
        "1":"PJSUA_CALL_MEDIA_ACTIVE", //Call media is active
        "2":"PJSUA_CALL_MEDIA_HOLD", // THe media is currently put on hold by local endpoint
        "3":"PJSUA_CALL_MEDIA_REMOTE_HOLD", // THe media is currently put on hold by remote endpoint
        "4":"PJSUA_CALL_MEDIA_ERROR" // The media responed error
        },//'Media state',
    22: {
        "0":"PJMEDIA_TYPE_NONE",
        "1":"PJMEDIA_TYPE_AUDIO",
        "2":"PJMEDIA_TYPE_VIDEO",
        "3":"PJMEDIA_TYPE_APPLICATION",
        "4":"PJMEDIA_TYPE_UNKNOWN"
         },//'Media type',
    23: undefined,//'Media codec info',
    24: {
        "0":"PJSIP_TP_STATE_CONNECTED",
        "1":"PJSIP_TP_STATE_DISCONNECTED",
        "2":"PJSIP_TP_STATE_SHUTDOWN",
        "3":"PJSIP_TP_STATE_DESTROY"
        },//'Transport state',
    25: {
        "0":"PJ_SUCCESS",
        "171060":"PJSIP_EUNSUPTRANSPORT",
        "171061":"PJSIP_EPENDINGTX",
        "171062":"PJSIP_ERXOVERFLOW",
        "171063":"PJSIP_EBUFDESTROYED",
        "171064":"PJSIP_ETPNOTSUITABLE",
        "171065":"PJSIP_ETPNOTAVAIL"
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
    44: {"0":"Normally","1":"Abnormally"},//'Call end status',
    45: {"0":"Incoming","1":"Outgoing"},//'Call direction',
    46: undefined,//'Call_id',
    47: undefined,//'Call end information',
    48: undefined,//'Address',
    49:{"0":"WEB_API_SERVER","1":"SIP_SERVER"},//'Server type',
    52: undefined,//'Hardcoded_ip',
    51: undefined,//'Size',
    52: undefined,//'Carrier name',
	// Home Monitoring
	1000:undefined,
	1001:undefined,
	1002:undefined,
	1003:undefined,
	1004:undefined,
	1005:undefined,
	1006:undefined,
	1007:undefined,
	1008:undefined,
	1009:undefined,
	1010:undefined,
	1011:undefined,
	1012:undefined,
	1013:undefined,
	1014:undefined,
	1015:undefined,
	1016:undefined,
	1017:undefined,

    999 :undefined //'Undefined'
};
function getEventNameAndType(inc_val) {

    var etype = event_type_dict[Math.round(inc_val/10000)] ;
    if (etype ==undefined) {
        etype=inc_val; }
    var ename = event_name_dict[inc_val];
    if (ename ==undefined) {
        ename=inc_val;}
    var result = [etype,ename];
    return result;
}

function getLabelName(labelid) {
    if (labelid == undefined) {
        labelid=999;
    }
    var result = labeldic[labelid];
    if (result ==undefined) {
        result=labelid;}
    return result;
};

function decodeEventValue(labelid,inc_value){
    if (labelid == undefined) {
        labelid=999;
    }
    if (inc_value == undefined) {
        inc_value="Undefined";
    }

    var phase_1 = values_dic[labelid];
    if (phase_1 == undefined)
        {return inc_value}
    else {
        var result = phase_1[inc_value]
        if (result ==undefined) {
            result=inc_value;}
        return result; }
}


module.exports.getLabelName = getLabelName;
module.exports.getEventNameAndType = getEventNameAndType;
module.exports.decodeEventValue = decodeEventValue;
