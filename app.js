var https = require('https');

var argv = process.argv
var isDebugMode = (process.env.IPHONE_CHECKER_DEBUG ? 
                   parseInt(process.env.IPHONE_CHECKER_DEBUG):
                   null);

console.log('debug mode: ' + (isDebugMode ? 'ON' : 'OFF'));
console.debug = isDebugMode ?  console.log : function(){};

var url = 'https://reserve.cdn-apple.com/' + 
          (argv.length == 4 ? argv[2] : 'HK') + '/' + 
          (argv.length == 4 ? argv[3] : 'en_HK') + 
          '/reserve/iPhone/availability.json';

var currentTime = function(){
    var d = new Date();
    return d.toLocaleTimeString();
};

var mapStoreName = function(storeId){
    if(!storeId || (typeof storeId != 'string')){
        return "Unknown store";
    }

    // map the known store
    switch(storeId){
        case "R409": return "HK - Hyson";
        case "R428": return "HK - IFC";
        case "R485": return "HK - Festival Walk";
        case "R150": return "JP - 仙台一番町";
        case "R005": return "JP - 名古屋栄";
        case "R091": return "JP - 心斎橋";
        case "R193": return "JP - 札幌";
        case "R119": return "JP - 渋谷";
        case "R048": return "JP - 福岡天神";
        case "R224": return "JP - 表参道";
        case "R079": return "JP - 銀座";
        case "R227": return "UK - Bentall Centre";
        case "R113": return "UK - Bluewater";
        case "R340": return "UK - Braehead";
        case "R163": return "UK - Brent Cross";
        case "R496": return "UK - Bromley";
        case "R135": return "UK - Buchanan Street";
        case "R118": return "UK - Bullring";
        case "R252": return "UK - Cabot Circus";
        case "R391": return "UK - Chapelfield";
        case "R244": return "UK - Churchill Square";
        case "R245": return "UK - Covent Garden";
        case "R393": return "UK - Cribbs Causeway";
        case "R545": return "UK - Drake Circus";
        case "R341": return "UK - Eldon Square";
        case "R482": return "UK - Festival Place";
        case "R270": return "UK - Grand Arcade";
        case "R308": return "UK - Highcross";
        case "R242": return "UK - Lakeside";
        case "R239": return "UK - Liverpool ONE";
        case "R215": return "UK - Manchester Arndale";
        case "R153": return "UK - Meadowhall";
        case "R423": return "UK - Metrocentre";
        case "R269": return "UK - Milton Keynes";
        case "R279": return "UK - Princesshay";
        case "R092": return "UK - Regent Street";
        case "R335": return "UK - SouthGate";
        case "R334": return "UK - St David's 2";
        case "R410": return "UK - Stratford City";
        case "R176": return "UK - The Oracle";
        case "R255": return "UK - Touchwood Centre";
        case "R136": return "UK - Trafford Centre";
        case "R372": return "UK - Trinity Leeds";
        case "R363": return "UK - Union Square";
        case "R313": return "UK - Victoria Square";
        case "R527": return "UK - Watford";
        case "R174": return "UK - WestQuay";
        case "R226": return "UK - White City";
        default: return "Unknown shop [" + storeId + "]"
    }



};

var mapModelName = function(modelId){
    if(!modelId || (typeof modelId != 'string')){
        return "Unknown model";
    }

    // map the known model
    if(/^MGA82/.test(modelId)){ return 'iPhone 6 Plus  16G Grey  ' }; 
    if(/^MGA92/.test(modelId)){ return 'iPhone 6 Plus  16G Silver' }; 
    if(/^MGAA2/.test(modelId)){ return 'iPhone 6 Plus  16G Gold  ' }; 
    if(/^MGAH2/.test(modelId)){ return 'iPhone 6 Plus  64G Grey  ' }; 
    if(/^MGAJ2/.test(modelId)){ return 'iPhone 6 Plus  64G Silver' }; 
    if(/^MGAK2/.test(modelId)){ return 'iPhone 6 Plus  64G Gold  ' }; 
    if(/^MGAC2/.test(modelId)){ return 'iPhone 6 Plus 128G Grey  ' }; 
    if(/^MGAE2/.test(modelId)){ return 'iPhone 6 Plus 128G Silver' }; 
    if(/^MGAF2/.test(modelId)){ return 'iPhone 6 Plus 128G Gold  ' }; 
    if(/^MG472/.test(modelId)){ return 'iPhone 6       16G Grey  ' }; 
    if(/^MG482/.test(modelId)){ return 'iPhone 6       16G Silver' }; 
    if(/^MG492/.test(modelId)){ return 'iPhone 6       16G Gold  ' }; 
    if(/^MG4F2/.test(modelId)){ return 'iPhone 6       64G Grey  ' }; 
    if(/^MG4H2/.test(modelId)){ return 'iPhone 6       64G Silver' }; 
    if(/^MG4J2/.test(modelId)){ return 'iPhone 6       64G Gold  ' }; 
    if(/^MG4A2/.test(modelId)){ return 'iPhone 6      128G Grey  ' }; 
    if(/^MG4C2/.test(modelId)){ return 'iPhone 6      128G Silver' }; 
    if(/^MG4E2/.test(modelId)){ return 'iPhone 6      128G Gold  ' }; 

    return "Unknown model [" + modelId + "]";
}

var parseResponse = function(response, callback){
    try{
        var responseJSON = JSON.parse(response);
        var callbackResult = null

        for(var perStore in responseJSON){
            var perObj = responseJSON[perStore];
            if(typeof perObj == 'object'){
                for(var perModel in perObj){
                    var perAvailability = perObj[perModel];
                    if(perAvailability){
                        console.debug(perStore + " - " + perModel);

                        var storeName = mapStoreName(perStore);
                        var modelName = mapModelName(perModel);

                        if(!callbackResult){
                            callbackResult = {};
                        }
                        if(!callbackResult[storeName]){
                            callbackResult[storeName] = [];
                        }
                        callbackResult[storeName].push(modelName);
                    }
                }
            }
        }
        callback(callbackResult);
    }catch(e){
        console.debug('Parsing error' + e.message);
        callback(null);
    }
};

var requestCallback = function(response) {
    var str = '';
    response.on('data', function (chunk) {
        str += chunk;
    })
    .on('end', function () {
        console.debug('[' + currentTime() + '] Get response');
        parseResponse(str, function(result){
            if(result){
                console.log('[' + currentTime() + '] iReserve available');
                for(var perStore in result){
                    console.log("------------\n" + perStore);
                    result[perStore].forEach(function(val){
                        console.log("      " + val);
                    });
                }
                console.log("\n\n\n");
                setTimeout(makeRequest, 1000);
            }
            else{
                //console.log('[' + currentTime() + '] No result');
                setTimeout(makeRequest, 5000);
            }
        });
    });
}

var makeRequest = function(){
    console.debug('Query URL: "' + url + '"');
    console.debug('[' + currentTime() + '] Request fires');
    https.get(url, requestCallback);
};

console.log('Application is running');

makeRequest();
