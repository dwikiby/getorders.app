module.exports = function (api) {

    api.cache(true);

    const presets = [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage", // alternative mode: "entry"
                "corejs": 3, // default would be 2
                "targets": "> 0.25%, not dead"
                // set your own target environment here (see Browserslist)
            }
        ],
        [
            "@babel/preset-react"
        ]
    ];
    const plugins = [
        ["@babel/plugin-transform-runtime", {
            "regenerator": true
        }]
    ];
    return {
        presets, plugins
    }

}