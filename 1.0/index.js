/**
 * @fileoverview 
 * @author 灵影<luntao.dlt@alibaba-inc.com>
 * @module timeselect
 **/
KISSY.add(function (S, DOM, Event, Base) {
    var EMPTY = '';
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
            //this.setSelectedTime([1,2,3,4,5,6,7,8,9,10,11,12,13]);
            this.setSelectedTime([]);
            this.tempSelected = [];
            this.tempSelectedTime = [];
            

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
            var startTime = self.get('startTime');
            var endTime = self.get('endTime');
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
                if (self.isActived(target) && target.tagName === 'LI') {
                    self.mousedown = true;
                    //清空临时选择容器
                    self.clearTime();
                    if (DOM.hasClass(target, 'selected')) {
                        self.backtempSelectedTime(target);
                    } else {
                        self.drawtempSelectedTime(target);
                    }
                } else {
                    self.fire('click');
                }
            });
            Event.on(self.tcEl, 'mouseover mouseout', function (e) {
                var target = e.target;
                if (self.mousedown && self.isActived(target)) {
                    if (e.type === 'mouseover') {
                        target.enterY = e.clientY;
                        if (DOM.hasClass(target, 'selected')) {
                            target.enterWidthClass = true;
                        } else {
                            self.drawtempSelectedTime(target);
                            self.enterY = e.clientY;
                            target.enterWidthClass = false;
                        }
                    } else {
                        e.leaveY = e.clientY;
                        if (Math.abs(e.leaveY - self.enterY) < 5) {
                            self.backtempSelectedTime(target);
                        }
                        if (target.enterWidthClass) {
                            self.backtempSelectedTime(target);
                        }
                        
                    }
                }
            });
            Event.on(self.tcEl, 'mouseup', function (e) {
                if (self.isActived(e.target) && e.target.tagName === 'LI') {
                    //重新整理数据
                    self.reData();
                    self.fire('select', self.tempSelectedTime);
                    self.mousedown = false;
                }
                self.saveTime();
                //self.clearTime();
            });

            self.eventListener();
        },
        //事件监听
        eventListener: function () {
            var self = this;
            //选择结束
            self.on('select', function (data) {
                console.log('select');
            });
            //点击时间选中区域
            self.on('click', function () {
                console.log('click');
            });
            //用户取消时间段
            self.on('cancle', function (data) {
                this.clearTime();
            });
            //用户确定时间
            self.on('sure', function (data) {
                this.saveTime();
            });
            //配置完成人数总数，预留人数
            self.on('', function () {

            });
        },
        //绘制选中的时间区域
        drawtempSelectedTime: function (el) {
            var self = this;
            DOM.addClass(el, 'selected');
            self.tempSelected.push(el);
            self.tempSelectedTime.push(Number(DOM.attr(el, 'data-num')));
        },
        //选中区域回退
        backtempSelectedTime: function (el) {
            var self = this;
            DOM.removeClass(el, 'selected');
            var tempSelectedTime = self.tempSelectedTime;
            tempSelectedTime.splice(tempSelectedTime.indexOf(DOM.attr(el, 'data-num'), 1));
        },
        //整理数组，去重，补齐漏掉值
        reData: function () {
            var self = this, newArr = [];
            var min = Math.min.apply(null, self.tempSelectedTime);
            var max = Math.max.apply(null, self.tempSelectedTime);
            var tempSelectedTime = self.tempSelectedTime = [];
            var val, listEl = self.listEl;
            S.each(listEl, function (el) {
                val = Number(DOM.attr(el, 'data-num'));
                if (val >= min && val <= max) {
                    tempSelectedTime.push(val);
                    if (!DOM.hasClass(el, 'selected') && self.isActived(el)) {
                        self.drawtempSelectedTime(el);
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
                self.setUnActived(el);
            });
            self.set('allSelectedTime', self.tempSelectedTime);
            //模拟
            self.setProgress(self.tempSelectedTime, 100*Math.random());
            console.log(self.get('allSelectedTime'));
            self.tempSelected = [];
            self.tempSelectedTime = [];
        },
        //清除时间区域
        clearTime: function () {
            var self = this;
            S.each(self.tempSelected, function (el) {
                DOM.removeClass(el, 'selected');
            });
            self.tempSelected = [];
            self.tempSelectedTime = [];
        },
        //设置为不活动状态
        setUnActived: function (el) {
            DOM.addClass(el, 'unactived');
        },
        //初始化预选中时间
        setSelectedTime: function (arr) {
            var self = this;
            var listEl = self.listEl;
            var map  = listToMap(arr);
            S.each(listEl, function (el) {
                if (map[DOM.attr(el, 'data-num')]) {
                    //添加选中样式
                    DOM.addClass(el, 'selected');
                    //设置为不活动状态
                    self.setUnActived(el);
                    //设置进度-test
                    self.setProgress(el, 50*Math.random());
                }
            });
        },

        //获取所有选择的时间
        getAllSelectedTime: function () {
            return this.allSelectedTime;
        },
        //设置选中时间段内百分比
        setProgress: function (arr, percent) {
            var self = this;
            var map = listToMap(arr);
            S.each(self.listEl, function (el) {
                if (map[DOM.attr(el, 'data-num')]) {
                    var childrenEl = DOM.get('.status', el);
                    DOM.css(childrenEl, {
                        'z-index':0,
                        'width':percent+'%'
                    });
                }
            });
            
        },
        //添加日期提示
        setTimeTip: function (obj) {
            var self = this;
            var min = obj.min;
            var max = obj.max;
            var plus = (max - min)/2;
            var str = obj.minTime + '--' + obj.maxTime;
            S.each(self.listEl, function (el) {
                if (DOM.attr(el, 'data-num') == min) {
                    var timeDom = DOM.create('<span class="time-tip">'+str+'</span>');
                    DOM.css(timeDom, 'top', (plus * 10) + 'px');
                    DOM.append(timeDom, el);

                }
            });
            
        },
        //num转化为时间
        _numToTime: function (num, type) {
            num = type === 'min' ? num -1 : num;
            var self = this;
            var startTime = self.get('startTime');
            var hour = Math.floor(num * 15 /60);
            var minute = num * 15 % 60;
            var time  = startTime + hour + (minute * 0.01);
            time = time = time<10 ? '0'+time : time + '';
            if (minute === 0) {
                time += ':00';
            } else {
                time = time.replace('.', ':');
                if (minute === 30) {
                    time += '0';
                }
            }
            return time;

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
        },
        'startTime': {
            getter: function () {
                return this.params.startTime
            }
        },
        'endTime': {
            getter: function () {
                return this.params.endTime
            }
        },
        'allSelectedTime': {
            setter: function (arr) {
                var self = this;
                if (!self.allSelectedTime) {
                        self.allSelectedTime = [];
                    }
                   
                var newArr = [];
                newArr = arr.slice(0);
                self.allSelectedTime.push(newArr);
                S.each(arr, function (val) {
                   // self.allSelectedTime.push(val);
                });

                if (!self.allTimeObj) {
                    self.allTimeObj = {};
                }
                var min = Math.min.apply(null, arr);
                var max = Math.max.apply(null, arr);
                var obj = {
                    minTime:self._numToTime(min,'min'),
                    maxTime:self._numToTime(max, 'max')
                }

                S.each(arr, function (val) {
                   self.allTimeObj[val] = obj;
                });
                //self.allTimeObj[min] = obj;

                self.setTimeTip(S.mix({min:min,max:max},obj));

            },
            getter: function () {
                console.log(this.allTimeObj);
                return this.allSelectedTime;
            }
        }
    }});
    //list转化为map
    function listToMap (arr) {
        var obj = {};
        S.each(arr, function (val) {
            if (!S.isObject(val)) {
                obj[val] = true;
            }
        });
        return obj;
    }

    S.augment(Timeselect, Event.Target);
    return Timeselect;
}, {requires:['dom', 'event', 'base']});



