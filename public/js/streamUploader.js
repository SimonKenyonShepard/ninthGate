define(["md5baseJS"], function(md5) {

    var fileHandle = "";

    var uploadButton = React.createClass({

        getInitialState : function() {
            return {style : "btn-default", buttonText : "Share stream"};
        },

        __onClick : function(evt) {
            this.setState({style : "btn-info"});
            this.setState({buttonText : "uploading"});
            this.__loadFileToMemory();
            return false;
        },

        __loadFileToMemory : function() {
            var reader = new FileReader();
            var button = this;
            var hashes = [];
            var pieceSizeInB = 499998;
            var numberOfPieces = Math.ceil(fileHandle.size/pieceSizeInB);
            var i = 0;
            
            reader.onload = function(e) {
                    i = i+1;
                    var pieces = {};
                    var data = e.target.result.substring(13);                         
                        var hashedID = md5(data);
                        hashes.push(hashedID);
                        button.__cachePiece(hashedID, data);
                    if(i === numberOfPieces) {
                        button.__uploadComplete(pieces, hashes);
                        button.setState({style : "btn-success"});
                        button.setState({buttonText : "completed"});
                    } else {
                        button.__loadNextPiece(i, pieceSizeInB, reader, fileHandle);
                    }
                
            };
            button.__loadNextPiece(i, pieceSizeInB, reader, fileHandle);
            /*
            reader.onload = function(e) {
                console.log(e.target.result, e.target.result.length);
                console.log(e.target.result.substring(e.target.result.length-20));
            }
            reader.readAsDataURL(fileHandle);
            */
            return false;
            
        },

        __loadNextPiece : function(pieceNumber, pieceSizeInB, reader, fileHandle) {
            var start = pieceNumber*pieceSizeInB;
            var stop = pieceNumber*pieceSizeInB+pieceSizeInB;
            if(stop > fileHandle.size) {
                stop = fileHandle.size;
            }
            console.log("cut piece from", start, stop, "size", fileHandle.size);
            var blob = fileHandle.slice(start, stop);
            //reader.readAsBinaryString(blob);
            reader.readAsDataURL(blob);
        },

        __cachePiece : function(piece, hash) {
            this.props.uploader.cachePiece(hash, piece);
        },

        __uploadComplete : function(pieces, hashes) {
            this.props.uploader.cacheStreamFile(hashes, $("#series").val(), $("#episode").val());
        },

        render: function() {

            return (
                React.DOM.button({
                    onClick : this.__onClick,
                    type : "submit",
                    className : "btn pull-right "+this.state.style,
                    children : this.state.buttonText
                })
            );
          }
    });

    var episodes = [{number : "Season 1 : Episode 1"}, {number : "Season 1 : Episode 2"}, {number : "Season 1 : Episode 3"}, {number : "Season 1 : Episode 4"}];

    var formSelect = React.createClass({
        render: function() {

            var selectNodes = this.props.data.map(function (stream) {
                return React.DOM.option({}, stream.number);
            });
            
            return (
                React.DOM.select({
                    id : "episode",
                    className : "form-control",
                    children : selectNodes
                })
            );
          }
    });

     var formGroup = React.createClass({

        __storeFileHandle : function(evt) {
            fileHandle = evt.target.files[0];
        },

        render: function() {

            var label = React.DOM.label({}, this.props.name);
            if(this.props.type === "text") {
                var control = React.DOM.input({type : this.props.type, id : this.props.name, placeholder : this.props.placeHolder, className : "form-control"});    
            } else if (this.props.type === "select") {
                var control = formSelect({data : episodes});       
            } else if (this.props.type === "file") {
                var control = React.DOM.input({type : this.props.type, id : this.props.name, className : "form-control", onChange : this.__storeFileHandle});
            }
            
            return (
                React.DOM.div({
                    className : "form-group",
                    children : [label, control]
                })
            );
          }
    });

     var uploadForm = React.createClass({
        render: function() {

            var seriesName = formGroup({name : "series", type : "text", placeholder : "Enter series name"});
            var episode = formGroup({name : "episode", type : "select"});
            var fileLocation = formGroup({name : "stream-file", type : "file"});
            var uploadButtonControl = uploadButton(this.props);
            var clearFix = React.DOM.div({className : "clearfix"});

            return (
                React.DOM.form({
                    role : "form",
                    onSubmit : function() {return false;},
                    children : [seriesName, episode, fileLocation, uploadButtonControl, clearFix]
                })
            );
          }
    });


    var uploader = React.createClass({
        render: function() {
            
            var title = React.DOM.h4({}, "Stream share:");

            return (
                React.DOM.div({
                    className : "uploader",
                    children : [title, uploadForm(this.props)]
                })
            );
          }
    });

    return React.createClass({
        render: function() {
            
            var title = React.DOM.h4({}, "current:");

            var streamersOnlineInfo = React.DOM.h5({}, "streamers online: 500");
            var videoSharedInfo = React.DOM.h5({}, "media shared: 1500");
            
            var uploadWidget = uploader(this.props);

            return (
                React.DOM.div({
                    className : "col-md-3",
                    children : React.DOM.div({
                        className : "info",
                        children : [title, streamersOnlineInfo, videoSharedInfo, uploadWidget]
                    })
                })
            );
          }
    });

});
