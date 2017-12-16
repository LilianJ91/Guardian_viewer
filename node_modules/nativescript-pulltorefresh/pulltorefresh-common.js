"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var content_view_1 = require("ui/content-view");
var view_1 = require("ui/core/view");
__export(require("ui/content-view"));
var PullToRefreshBase = (function (_super) {
    __extends(PullToRefreshBase, _super);
    function PullToRefreshBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PullToRefreshBase.prototype._addChildFromBuilder = function (name, value) {
        var originalColor = value.style.color || null;
        if (value instanceof view_1.View) {
            this.content = value;
        }
        value.style.color = originalColor;
    };
    return PullToRefreshBase;
}(content_view_1.ContentView));
PullToRefreshBase.refreshEvent = "refresh";
exports.PullToRefreshBase = PullToRefreshBase;
exports.refreshingProperty = new view_1.Property({
    name: "refreshing",
    defaultValue: false
});
exports.refreshingProperty.register(PullToRefreshBase);
//# sourceMappingURL=pulltorefresh-common.js.map