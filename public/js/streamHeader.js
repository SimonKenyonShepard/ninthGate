define([], function() {
    return React.createClass({
        render: function() {
            return (
                React.DOM.div({
                    className: 'row header',
                    children : [
                        React.DOM.div({className : "col-md-3",
                                        children : React.DOM.h1({}, 'ninthGate')
                                    }),
                        React.DOM.div({className : "col-md-9 mainSearch",
                                        children : React.DOM.input({
                                            type : "text",
                                            id : "mainSearch",
                                            className : "mainInput",
                                            placeholder : "search for titles and series"
                                        })
                                    }),
                    ]
                })
            );
          }
    });
});