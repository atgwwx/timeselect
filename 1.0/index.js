/**
 * @fileoverview 
 * @author 灵影<luntao.dlt@alibaba-inc.com>
 * @module timeselect
 **/
KISSY.add(function (S, DOM, Event, Base) {
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
        self.init(comConfig);

    }
    S.extend(Timeselect, Base, /** @lends Timeselect.prototype*/{
        //初始化
        init: function (comConfig) {
            this.params = {
                startTime:8,
                endTime:20,
                width:300,
                bgColor:'#eee',
                selectedColor:'#b8ddfd',
                disableColor:'#aaa',
                progressColor:'#63a6f5'
            }
            comConfig = comConfig || {};
            S.mix(this.params, comConfig);
            this.render();

            var el = this.el;
            var tcEl = this.tcEl = DOM.get('.timecontent', el);
            this.listEl = DOM.query('li', tcEl);
            this.bindEvent();
            this.tempSelected = [];
            this.selectedTime = [];
            //选择结束
            this.on('end', function (data) {
                console.log(data);
            });
            //用户取消时间段
            this.on('cancle', function (data) {
                this.clearTime();
            });
            //用于确定时间短
            this.on('sure', function (data) {
                this.saveTime();
            });

        },
        //渲染html
        render: function () {
            var self = this;
            if (!self.get('id')) {
                return;
            }
            var container = DOM.get('#' + self.get('id'));
            var html = '',i,temStr;
            html += '<div class="timepanel">' +
                        '<div class="timeline">' + 
                            '<ul>' ;
            var startTime = 8, endTime = 20;
            for (i = startTime; i <= endTime; i++ ){
                html += '<li class="timeline-item' + ((i === endTime) ? ' lastone' : '') + '">' + (i < 10 ? '0'+i : i) + ':00</li>';
            }
            html += '</ul>' +
                     '</div>';
            html += '<div class="timecontent" ' + 'style="background:' + self.get('bgColor') + '">' +
                        '<ul>';
            var endTimeNum = (endTime - startTime + 1) * 4;
            for (i = 1; i <= endTimeNum; i++) {
                html += '<li class="timecontent-item' + ((i === endTimeNum) ? ' lastone' : '') + '" data-num="' + i + '">';
                temStr = '<div class="status"></div>';
                html += temStr + '</li>';
            }
            html += '</ul>'+
                    '</div>';
            this.el = DOM.create(html);
            if (self.get('width')) {
                DOM.css(this.el, 'width', self.get('width') + 'px');
            }
            DOM.append(this.el, container);
        },
        //绑定事件
        bindEvent: function () {
            var self = this;
            Event.on(self.tcEl, 'mousedown', function (e) {
                var target = e.target;
                self.startEl = target;
                if (self.isActived(target)) {
                    self.mousedown = true;
                    //清空临时选择容器
                    self.clearTime();
                    if (DOM.hasClass(target, 'selected')) {
                        self.backSelectedTime(target);
                    } else {
                        self.drawSelectedTime(target);
                    }
                } else {

                }
            });
            Event.on(DOM.query('li', self.tcEl), 'mouseenter mouseleave', function (e) {
                var target = e.target;
                if (self.mousedown && self.isActived(target)) {
                    if (e.type === 'mouseenter') {
                        target.enterY = e.clientY;
                        if (DOM.hasClass(target, 'selected')) {
                            target.enterWidthClass = true;
                        } else {
                            self.drawSelectedTime(target);
                            self.enterY = e.clientY;
                            target.enterWidthClass = false;
                        }
                    } else {
                        e.leaveY = e.clientY;
                        if (Math.abs(e.leaveY - self.enterY) < 5) {
                            self.backSelectedTime(target);
                        }
                        if (target.enterWidthClass) {
                            self.backSelectedTime(target);
                        }
                        
                    }
                }
            });
            Event.on(self.tcEl, 'mouseup', function (e) {
                if (self.isActived(e.target)) {
                    //重新整理数据
                    self.reData();
                    self.fire('end', self.selectedTime);
                    self.mousedown = false;
                }
                //self.clearTime();
            });
        },
        //绘制选中的时间区域
        drawSelectedTime: function (el) {
            var self = this;
            DOM.addClass(el, 'selected');
            self.tempSelected.push(el);
            self.selectedTime.push(Number(DOM.attr(el, 'data-num')));
        },
        //选中区域回退
        backSelectedTime: function (el) {
            var self = this;
            DOM.removeClass(el, 'selected');
            var selectedTime = self.selectedTime;
            selectedTime.splice(selectedTime.indexOf(DOM.attr(el, 'data-num'), 1));
        },
        //设置选中时间段内百分比
        setProgress: function (num) {
            var self = this;
            S.each(self.tempSelected, function (el) {
                DOM.css(DOM.children(el), 'z-index', '0');
            });
        },
        //整理数组，去重，补齐漏掉值
        reData: function () {
            var self = this, newArr = [];
            var min = Math.min.apply(null, self.selectedTime);
            var max = Math.max.apply(null, self.selectedTime);
            console.log(min, max);

            var val, listEl = self.listEl;
            S.each(listEl, function (el) {
                val = Number(DOM.attr(el, 'data-num'));
                console.log(val);
                if (val >= min && val <= max) {
                    if (!DOM.hasClass(el, 'selected') && self.isActived(el)) {
                        self.drawSelectedTime(el);
                    }
                }
            });
        },
        //是否活动可选
        isActived: function (el) {
            if (DOM.hasClass(el, 'unactived')) {
                return false;
            } else  {
                return true;
            }
        },
        //保存时间选取
        saveTime: function () {
            var self = this;
            S.each(self.tempSelected, function (el) {
                DOM.addClass(el, 'unactived');
            });

            self.tempSelected = [];
            self.selectedTime = [];
        },
        //清除时间区域
        clearTime: function () {
            var self = this;
            S.each(self.tempSelected, function (el) {
                DOM.removeClass(el, 'selected');
            });
            self.tempSelected = [];
            self.selectedTime = [];
        }


    }, {ATTRS : /** @lends Timeselect*/{
        'width': {
            getter: function () {
                return this.params.width;
            }
        },
        'id': {
            getter: function () {
                return this.params.id;
            }
        },
        'bgColor': {
            getter: function () {
                return this.params.bgColor;
            }
        }
    }});

    S.augment(Timeselect, Event.Target);
    return Timeselect;
}, {requires:['dom', 'event', 'base']});



