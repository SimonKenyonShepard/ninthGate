define(["md5baseJS"], function(md5) {

    var myCatalogue = [],
        inMemoryData = {},
        localData = {};

    var cachePiecesInMemory = function(pieces) {
        for(var piece in pieces) {
            if(md5(pieces[piece]) === piece) {
                cachePiece(piece, pieces[piece]);
                console.log("cached valid piece");    
            } else {
                console.log("invalid piece received");
            }
            
        }
    };

    var cachePiece = function(hash, piece, range, fileHandle) {
        if(range) {
            localData[hash] = {
                range : range,
                fileHandle : fileHandle
            };    
        } else {
            inMemoryData[hash] = piece;
        }
        
    };

    var getMyCatalogue = function() {
        return myCatalogue;
    };

    var getPiece = function(pieceID, callback) {
        if(inMemoryData[pieceID]) {
            setTimeout(function() {
                callback(inMemoryData[pieceID]);
            }, 0);
        } else if (localData[pieceID]) {
            console.log(localData[pieceID].range);
            getLocalPiece(pieceID, localData[pieceID].fileHandle, localData[pieceID].range, callback);
        } else {
            console.log("error piece missing");
        }
    };

    var getLocalPiece = function(pieceID, fileHandle, range, callback) {
        var reader = new FileReader();
        var blob = fileHandle.slice(range.start, range.stop);
        reader.onload = function(e) {
            var data = e.target.result.substring(13);
            console.log(pieceID);
            callback(pieceID, data);
        };
        reader.readAsDataURL(blob);

    };

    var cacheStreamFile = function(hashes, series, seasonAndEpisode, fileHandle, reader) {

        var id = md5(series.trim()+seasonAndEpisode.split(":")[0].trim()+seasonAndEpisode.split(":")[1].trim());
        myCatalogue.push({
            "name" : series.trim(),
            "season" : seasonAndEpisode.split(":")[0].trim(),
            "episode" : seasonAndEpisode.split(":")[1].trim(),
            "lang" : "en",
            "pieces" : hashes,
            "id" : id               
        });
        console.log(myCatalogue);

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
                cachePiece(hashedID, data, range, fileHandle);
            if(i === numberOfPieces) {
                cacheStreamFile(hashes, $("#series").val(), $("#episode").val(), fileHandle, reader);
                callBack("success");
            } else {
                range = loadNextPiece(i, pieceSizeInB, reader, fileHandle);
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

    var getVideoData = function(pieces) {

        var allPieces = ["data:video/webm;base64,"];
        for(var i = 0; i < pieces.length; i++) {
            if(inMemoryData[pieces[i]]) {
                allPieces.push(inMemoryData[pieces[i]]);
            }
        }
        if(allPieces.length === pieces.length+1) {
            return allPieces;
        } else {
            return false;
        }
    };


    return {
        getMyCatalogue : getMyCatalogue,
        getPiece : getPiece,
        cachePiece : cachePiece,
        cachePiecesInMemory : cachePiecesInMemory,
        loadLocalFile : loadLocalFile,
        getVideoData : getVideoData
    }
});

