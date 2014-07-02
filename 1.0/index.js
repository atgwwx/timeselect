/**
 * @fileoverview 
 * @author 灵影<luntao.dlt@alibaba-inc.com>
 * @module timeselect
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class Timeselect
     * @constructor
     * @extends Base
     */
    function Timeselect(comConfig) {
        var self = this;
        //调用父类构造函数
        Timeselect.superclass.constructor.call(self, comConfig);
    }
    S.extend(Timeselect, Base, /** @lends Timeselect.prototype*/{

    }, {ATTRS : /** @lends Timeselect*/{

    }});
    return Timeselect;
}, {requires:['node', 'base']});



