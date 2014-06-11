define([], function() {

    var videoPlayer = React.createClass({
        render: function() {
            var ms = new MediaSource();
            return (
                React.DOM.video({
                    className: 'streamPlayer',
                    controls : "true",
                    src : window.URL.createObjectURL(this.props.videoData)
                })
            );
          }
    });

    return React.createClass({
        
        render: function() {
            
            var stageTitle = React.DOM.h4({}," Series name");
            var stage = React.DOM.div({
                  className : "row streamStage " + this.props.visible
                }, [stageTitle, videoPlayer(this.props)]);

            return (
                React.DOM.div({
                    children : stage
                })
            );
          }
    });
});