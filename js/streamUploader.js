define(["md5baseJS"], function(md5) {

    var fileHandle = "";

    var uploadButton = React.createClass({

        getInitialState : function() {
            return {style : "btn-default", buttonText : "Share stream"};
        },

        __onClick : function(evt) {
            this.setState({style : "btn-info"});
            this.setState({buttonText : "uploading"});
            var button = this;
            this.props.uploader.loadLocalFile(fileHandle, function() {
                button.setState({style : "btn-success"});
                button.setState({buttonText : "completed"});
            })
            return false;
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

            var seriesName = formGroup({name : "description", type : "text", placeholder : "Enter description"});
            var fileLocation = formGroup({name : "stream-file", type : "file"});
            var uploadButtonControl = uploadButton(this.props);
            var clearFix = React.DOM.div({className : "clearfix"});

            return (
                React.DOM.form({
                    role : "form",
                    onSubmit : function() {return false;},
                    children : [seriesName, fileLocation, uploadButtonControl, clearFix]
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

            var streamersOnlineInfo = React.DOM.h5({}, "streamers online: "+this.props.streamersCount);
            var videoSharedInfo = React.DOM.h5({}, "media shared: "+this.props.mediaCount);
            
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
