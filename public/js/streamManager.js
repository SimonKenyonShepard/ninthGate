define(["md5baseJS"], function(md5) {

    var peer,
        streamers,
        myCatalogue = [],
        remoteCatalogue = {},
        streamData = {},
        actions = [
            {type : "getCatalogue", response : "sendCatalogue" },
            {type : "recieveCatalogue", response : "storeCatalogue"},
            {type : "sendStreamPiece", response : "requestStreamPiece" },
            {type : "recieveStreamPiece", response : "cacheStreamPiece" }
        ],
        responses = {
            sendCatalogue : function(streamer, data) {
                makeRequest(streamer, {type : "1", payload : JSON.stringify(myCatalogue)});
            },
            storeCatalogue : function(streamer, data) {
                remoteCatalogue[streamer] = JSON.parse(data.payload);
            },
            requestStreamPiece : function(streamer, data) {
                makeRequest(streamer, {type : "3", videoID : data.videoID, payload : streamData[data.videoID]});
            },
            cacheStreamPiece : function(streamer, data) {
                streamData[data.videoID] = data.payload;
            }
        };

    var connectToSignallingHost = function() {

        var peer = new Peer(myID, {host: '192.168.178.43', port: 9000, path: '/myapp'});
        
        peer.on('connection', function(conn) {
            conn.on('data', function(data){
                console.log("receive reqest", data, conn);
                recieveRequest(data, conn);
            });
        });

        return peer;
    };
   

    var getRemoteCataloges = function() {
        for(var streamer in streamers) {
            makeRequest(streamer, {type : 0});
        }
    };

    var getStreamers = function(callback) {
        $.getJSON("/streamers", function(data) {
            streamers = data;
            callback(data);
        });
    };

    var makeRequest = function(streamer, action) {
        var conn = peer.connect(streamer);
        console.log("make request", streamer, action);
        conn.on('open', function(){
            conn.send(action);
        });         
    };

    var recieveRequest = function(data, conn) {
        var requestType = data.type;
        var streamer = conn.peer;
        for(var i = 0; i < actions.length; i++) {
            if(String(requestType) === String(i)) {
                responses[actions[i].response](streamer, data);
            }
        }
    };

    var getStoredCatalogues = function() {
        var mergedCatalogue = [];
        for(var remoteCatalogueStreamer in remoteCatalogue) {
            mergedCatalogue = mergedCatalogue.concat(remoteCatalogue[remoteCatalogueStreamer]);
        }
        return mergedCatalogue;
    };

    var searchCatalogueForItem = function(item) {
        for(var remoteCatalogueStreamer in remoteCatalogue) {
            var catalogue = remoteCatalogue[remoteCatalogueStreamer];
            for(var i = 0; i < catalogue.length; i++) {
                if(catalogue[i].name === item.name &&
                   catalogue[i].season === item.season &&
                   catalogue[i].episode === item.episode) {
                    return {
                        streamer : remoteCatalogueStreamer,
                        data : catalogue[i]
                    };
                }
            }
        }
    };

    var cacheStreamFile = function(file, series, seasonAndEpisode) {

        var id = md5(series.trim()+seasonAndEpisode.split(":")[0].trim()+seasonAndEpisode.split(":")[1].trim());
        myCatalogue.push({
            "name" : series.trim(),
            "season" : seasonAndEpisode.split(":")[0].trim(),
            "episode" : seasonAndEpisode.split(":")[1].trim(),
            "lang" : "en",
            "id" : id                
        });
        streamData[id] = file;

    };

    var getVideo = function(item) {

        var catalogueEntry = searchCatalogueForItem(item);
        if(catalogueEntry) {
            makeRequest(catalogueEntry.streamer, {type : "2", videoID : catalogueEntry.data.id});
            return catalogueEntry.data.id;
        } else {
            return "failed no streamer found with that in their catalogue";
        }

    };

    var getVideoData = function(id) {
        return streamData[id];
    };

    var init = function() {

        peer = connectToSignallingHost();
        getStreamers(getRemoteCataloges);

    };

    init();

    return {
        getStoredCatalogues : getStoredCatalogues,
        cacheStreamFile : cacheStreamFile,
        getVideo : getVideo,
        getVideoData : getVideoData
    }
});

