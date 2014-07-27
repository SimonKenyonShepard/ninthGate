define([], function() {

    var availableStream = React.createClass({
        render: function() {
            return (
                React.DOM.div({
                    className: 'col-md-3 availableShow',
                    onClick : this.props.callBack
                }, this.props.data.name + ": " + this.props.data.season+" : "+this.props.data.episode)
            );
          }
    });

    return React.createClass({
        
        render: function() {
            var streamCount = 0;
            var properties = this.props;
            var streamData = this.props.catalogue || [];
            var streamNodes = streamData.map(function (stream) {
                streamCount++;
                return availableStream({data : stream, callBack : properties.clickEvent});
            });
            var streamInfo = React.DOM.h4({}, streamCount+" available streams");
            var availableStreams = React.DOM.div({
                  className : "row availableStreams",
                }, streamNodes);

            return (
                React.DOM.div({
                    children : [streamInfo, availableStreams]
                })
            );
          }
    });
});