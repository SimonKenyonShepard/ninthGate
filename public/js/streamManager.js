define(["md5baseJS"], function(md5) {

    var peer,
        streamers,
        myCatalogue = [],
        remoteCatalogue = {},
        streamData = {},
        localData = {},
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
                var pieces = {};
                for(var i = 0; i < data.pieces.length; i++) {
                    pieces[data.pieces[i]] = streamData[data.pieces[i]];
                }
                makeRequest(streamer, {type : "3", pieces : pieces});

            },
            cacheStreamPiece : function(streamer, data) {
                cachePieces(data.pieces);
            }
        };

    var connectToSignallingHost = function() {

        var peer = new Peer("", {host: '192.168.178.43', port: 9000, path: '/myapp'});
        
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

    var cacheStreamFile = function(hashes, series, seasonAndEpisode, fileHandle) {

        var id = md5(series.trim()+seasonAndEpisode.split(":")[0].trim()+seasonAndEpisode.split(":")[1].trim());
        myCatalogue.push({
            "name" : series.trim(),
            "season" : seasonAndEpisode.split(":")[0].trim(),
            "episode" : seasonAndEpisode.split(":")[1].trim(),
            "lang" : "en",
            "pieces" : hashes,
            "id" : id,
            "fileHandle" : fileHandle                
        });
        console.log(myCatalogue);
        console.log(localData);

    };

    var cachePieces = function(pieces) {
        for(var piece in pieces) {
            if(md5(pieces[piece]) === piece) {
                cachePiece(piece, pieces[piece]);
                console.log("cached valid piece");    
            } else {
                console.log("invalid piece received");
            }
            
        }
    };

    var cachePiece = function(hash, piece, range) {
        streamData[hash] = piece;
        if(range) {
            localData[hash] = range;    
        }
        
    };

    var getVideo = function(item) {

        var catalogueEntry = searchCatalogueForItem(item);
        if(catalogueEntry) {
            makeRequest(catalogueEntry.streamer, {type : "2", pieces : catalogueEntry.data.pieces});
            return catalogueEntry.data.pieces;
        } else {
            return "failed no streamer found with that in their catalogue";
        }

    };

    var getVideoData = function(pieces) {

        var allPieces = ["data:video/webm;base64,"];
        for(var i = 0; i < pieces.length; i++) {
            if(streamData[pieces[i]]) {
                allPieces.push(streamData[pieces[i]]);
            }
        }
        if(allPieces.length === pieces.length+1) {
            return allPieces;
        } else {
            return false;
        }
    };

    var loadLocalFile = function(fileHandle, callBack) {
        var reader = new FileReader();
        var button = this;
        var hashes = [];
        var pieceSizeInB = 499998;
        var numberOfPieces = Math.ceil(fileHandle.size/pieceSizeInB);
        var range;
        var i = 0;
        
        reader.onload = function(e) {
                i = i+1;
                var pieces = {};
                console.log(e.target);
                var data = e.target.result.substring(13);                         
                    var hashedID = md5(data);
                    hashes.push(hashedID);
                    cachePiece(hashedID, data, range);
                if(i === numberOfPieces) {
                    cacheStreamFile(hashes, $("#series").val(), $("#episode").val(), fileHandle);
                    callBack("success");
                } else {
                    loadNextPiece(i, pieceSizeInB, reader, fileHandle);
                }
            
        };
        range = loadNextPiece(i, pieceSizeInB, reader, fileHandle);
        /*
        reader.onload = function(e) {
            console.log(e.target.result, e.target.result.length);
            console.log(e.target.result.substring(e.target.result.length-20));
        }
        reader.readAsDataURL(fileHandle);
        */
    };

    var loadNextPiece = function(pieceNumber, pieceSizeInB, reader, fileHandle) {
        var start = pieceNumber*pieceSizeInB;
        var stop = pieceNumber*pieceSizeInB+pieceSizeInB;
        if(stop > fileHandle.size) {
            stop = fileHandle.size;
        }
        console.log("cut piece from", start, stop, "size", fileHandle.size);
        var blob = fileHandle.slice(start, stop);
        //reader.readAsBinaryString(blob);
        reader.readAsDataURL(blob);
        return { start : start, stop : stop};
    };


    var init = function() {

        peer = connectToSignallingHost();
        getStreamers(getRemoteCataloges);

    };

    init();

    return {
        getStoredCatalogues : getStoredCatalogues,
        cacheStreamFile : cacheStreamFile,
        cachePiece : cachePiece,
        getVideo : getVideo,
        getVideoData : getVideoData,
        loadLocalFile : loadLocalFile,
    }
});

