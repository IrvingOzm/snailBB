  JSONEditor.defaults.editors.positionSelect = JSONEditor.AbstractEditor.extend({

    build:function () {
    var self = this;
    console.log(10);
    this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
    /**
     * 必填加*号提示
     * ouziming
     */
    if ((this.schema.minLength && this.schema.minLength >= 1) || (this.jsoneditor.schema.required && this.jsoneditor.schema.required.indexOf(this.key) > -1)) {
      if (!this.options.compact) this.title = this.header = this.label = this.theme.getFormRequiredInputLabel(this.getTitle());
    } else {
      if (!this.options.compact) this.title = this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
    }

    //
    self.PositionSelectLabel =  self.theme.getFormInputLabel('坐标选择');
    // self.PositionSelectContainer =  self.theme.getFormInputField('text');
    self.PositionSelectContainer =   document.createElement('div');
    self.PositionSelectContainer.id = 'l-map';
    self.PositionSelectContainer.style.width = '500px';
    self.PositionSelectContainer.style.height = '200px';
    self.PositionSelectContainer.classList.add('checkResident');
    self.PositionSelectWrap = self.theme.getFormControl(self.PositionSelectLabel,self.PositionSelectContainer);
    self.PositionSelectWrap.style.position = 'relative';
    self.container.appendChild(self.PositionSelectWrap);
    console.log(self.PositionSelectWrap);
    var scri = document.createElement("script");
    scri.src="http://api.map.baidu.com/getscript?v=2.0&ak=2xUqFSZa1fjwhOzOtqNuclK7Iho5XCIE&services=&t=20200327103013";
    // self.PositionSelectWrap.appendChild(scri);
    var searchInputWrap = document.createElement('div');
    searchInputWrap.id = 'r-result';
    searchInputWrap.style.position = 'absolute';
    searchInputWrap.style.top = '0px';
    searchInputWrap.style.left = '120px';
     var style = document.createElement("style");

     style.type = "text/css";
        style.appendChild(document.createTextNode(".tangram-suggestion-main {z-index: 10000;}"));
        document.head.appendChild(style);
    searchInputWrap.innerHTML = '请输入:' ;
    var  searchInput = document.createElement('input');
    searchInput.id = 'suggestId';
    searchInput.setAttribute("type","text");
    searchInput.style.width = '150px';
    searchInputWrap.appendChild(searchInput);
    self.PositionSelectWrap.append(searchInputWrap);
    var searchDiv = document.createElement('div');
    searchDiv.id =  'searchResultPanel' ;
    searchDiv.style.border = 'border:1px solid #C0C0C0;';
    searchDiv.style.width = '150px';
    searchDiv.style.height = 'auto';
    searchDiv.style.display = 'none';
    self.PositionSelectWrap.append(searchDiv);
    scri.onload =function () {
      var map = new BMap.Map("l-map",{enableMapClick:false});
      // 百度地图API功能
      function G(id) {
        return document.getElementById(id);
      }


      map.centerAndZoom("北京", 12);                   // 初始化地图,设置城市和地图级别。

      var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
          {
            "input": "suggestId",
             "location": map
          });

      ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
        var str = "";
        var _value = e.fromitem.value;
        var value = "";
        if (e.fromitem.index > -1) {
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

        value = "";
        if (e.toitem.index > -1) {
          _value = e.toitem.value;
          value = _value.province + _value.city + _value.district + _value.street + _value.business;
        }
        str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
        G("searchResultPanel").innerHTML = str;
      });

      var myValue;
        function setPlace() {
            var local ;
            map.clearOverlays();    //清除地图上所有覆盖物

            function myFun() {
                var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
                console.log('初始坐标');
                console.log(pp);
                map.centerAndZoom(pp, 18);
                var marker = new BMap.Marker(pp);
                map.addOverlay(marker);    //添加标注
                marker.enableDragging();
                self.setValue({location:pp});
                marker.addEventListener('dragend',function (e) {
                    console.log(e.point);
                    self.setValue({location:e.point});
                });
            }
            local = new BMap.LocalSearch(map, { //智能搜索
                onSearchComplete: myFun
            });




            local.search(myValue);
        }
      ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
        var _value = e.item.value;
        myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
        G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

        setPlace();
      });



      map.enableScrollWheelZoom(true);
      setTimeout(function(){
        map.enableDragging();   //两秒后开启拖拽
        //map.enableInertialDragging();   //两秒后开启惯性拖拽
      }, 2000);

    };
    document.head.appendChild(scri);

  // },1000)

  },

  setValue: function (val) {
    if(val){
      this.value =JSON.stringify(val);
      this.onChange(true);
      console.log(this.value);
    }


  }
});
