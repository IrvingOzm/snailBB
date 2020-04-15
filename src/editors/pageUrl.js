JSONEditor.defaults.editors.pageUrl = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  build:  function () {
    var self = this;

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
    // this.container.append(this.title)
    var arr = this.initSelectArr();
    this.castArr = this.castSelect(arr);

    var enterpriseData = this.get('http://localhost:8082/api/theme-pages?enterpriseCode=020588549',function (res) {
      // console.log(res);
    });

    this.input = this.theme.getSelectInput(this.castArr);
    this.selectWrap = this.theme.getFormControl(this.title, this.input);
    this.container.append(this.selectWrap);


    var val  ={id:this.input.value};
     var inputVal =  this.initSelectArr().filter(function (i) {
        return i.name === val.id;
    })[0];
    inputVal.items.map(function (item) {
      val[item]='';
    });
    this.setValue(JSON.stringify(val));
    this.input.addEventListener('change', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var val  ={id:self.input.value};
      var inputVal  = self.initSelectArr().filter(function (item) {
         return item.name === self.input.value;
      })[0];
      inputVal.items.map(function (item) {
        val[item]='';
      });
      self.setValue(JSON.stringify(val));

    });



    // setTimeout(function () {
    //   self.setJsonValue('localItem',self);
    // },0);

  },


  get: function (url, callback) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
      callback(oReq.responseText);
    };
    oReq.open("get", url, true);
    oReq.send();
  },

  inits:function(arr,self,isFirst) {
    //初始化第一个栏目
    arr[0].create(self,isFirst);
  },
  setJsonValue:function(name,self){
    var data ={};
    var arr = self.initSelectArr();
    data.id = self.input.value;
    var changeItems = arr.filter(function (item) {
      return item.id===name;
    })[0].items;


    changeItems.map(function (changeItem) {
      var itemType = self[changeItem+'Input'].getAttribute('type');
      if(itemType === 'checkbox'){
        data[changeItem] = self[changeItem+'Input'].checked;
      }else{
        data[changeItem] = self[changeItem+'Input'].value;
      }
    });

    self.setValue(JSON.stringify(data));
    self.onChange(true);
  },
  initSelectArr:function() {
    var arr = [
      {name:'本地栏目',create:this.createItemByLocalItem,items:['localItem'],id:'localItem'},
      {name:'远程网站',create:this.createWebSiteItem,items:['webSite'],id:'webSite'},
      {name:'本地应用路径',create:this.createLocalSrcItem,items:['localSrc','androidSrc','linuxSrc','resident'],id:'localSrc'},
      {name:'windows注册表',create:this.createRegistryItem,items:['registry','registryKey','resident'],id:'registry'},
    ];
    return arr;
  },

  castSelect:function(arr) {
    var mapArr = arr.map(function (item) {
      return  item.name;
    });
    return  mapArr;
  },

  createItemByLocalItem:function(self,isFirst ){
    //请求数据
    var name ='localItem';
    var labelName = '本地栏目';
    self[name+'Title'] =  self.theme.getFormInputLabel(labelName);
    self[name+'Input'] =  self.theme.getSelectInput(self.castArr);
    self[name+'Input'].classList.add(name);
    self[name+'Wrap'] = self.theme.getFormControl(self[name+'Title'],self[name+'Input']);
    self.container.appendChild(self[name+'Wrap']);
    self.destroyOtherItems(name,self,isFirst);
    //监听事件。
    self[name+'Input'].addEventListener('change',function () {
      self.concatData(self);
    });


  },
  createWebSiteItem:function (self,isFirst){
    var name ='webSite';
    var labelName = '网址';
    self[name+'Title'] =  self.theme.getFormInputLabel(labelName);
    self[name+'Input'] =  self.theme.getFormInputField('text');
    self[name+'Input'].classList.add(name);
    self[name+'Wrap'] = self.theme.getFormControl(self[name+'Title'],self[name+'Input']);
    self.container.appendChild(self[name+'Wrap']);
    self.destroyOtherItems(name,self,isFirst);
    self[name+'Input'].addEventListener('change',function () {
      // self.setJsonValue(name,self);
      self.concatData(self);

    });
  },

  concatData :function (self) {
    var val  ={id:self.input.value};
    var inputVal  = self.initSelectArr().filter(function (item) {
      return item.name === self.input.value;
    })[0];
    inputVal.items.map(function (item) {
      if(self[item+'Input'].type ==='checkbox'){
        val[item] = self[item+'Input'].checked;
      }else{
        val[item]=self[item+'Input'].value;
      }

    });
    self.destroyOtherItems('',self,false);

    self.setValue(JSON.stringify(val));
  },

  createLocalSrcItem:function (self,isFirst){
    var name ='localSrc';
    var labelName = 'windows地址';
    self[name+'Title'] =  self.theme.getFormInputLabel(labelName);
    self[name+'Input'] =  self.theme.getFormInputField('text');
    self[name+'Input'].classList.add(name);
    self[name+'Wrap'] = self.theme.getFormControl(self[name+'Title'],self[name+'Input']);
    self.container.appendChild(self[name+'Wrap']);
    self.destroyOtherItems(name,self,isFirst);
    self[name+'Input'].addEventListener('change',function () {
      // self.setJsonValue(name,self);
      self.concatData(self);
    });


    var androidName ='androidSrc';
    var androidLabelName = 'Andorid安装包地址';
    self[androidName+'Title'] =  self.theme.getFormInputLabel(androidLabelName);
    self[androidName+'Input'] =  self.theme.getFormInputField('text');
    self[androidName+'Wrap'] = self.theme.getFormControl(self[androidName+'Title'],self[androidName+'Input']);
    self.container.appendChild(self[androidName+'Wrap']);
    self[androidName+'Input'].addEventListener('change',function () {
      // self.setJsonValue(name,self);
      self.concatData(self);
    });

    var linuxName ='linuxSrc';
    var linuxLabelName = 'linux安装包地址';
    self[linuxName+'Title'] =  self.theme.getFormInputLabel(linuxLabelName);
    self[linuxName+'Input'] =  self.theme.getFormInputField('text');
    self[linuxName+'Wrap'] = self.theme.getFormControl(self[linuxName+'Title'],self[linuxName+'Input']);
    self.container.appendChild(self[linuxName+'Wrap']);
    self[linuxName+'Input'].addEventListener('change',function () {
      // self.setJsonValue(name,self);
      self.concatData(self);
    });


    var checkboxName ='resident';
    var checkboxLabelName = '后台常驻';
    self[checkboxName+'Title'] =  self.theme.getFormInputLabel(checkboxLabelName);
    self[checkboxName+'Input'] =  self.theme.getFormInputField('checkbox');
    self[checkboxName+'Input'].classList.add('checkResident');
    self[checkboxName+'Wrap'] = self.theme.getFormControl(self[checkboxName+'Title'],self[checkboxName+'Input']);
    self[checkboxName+'Wrap'].style.marginBottom='10px';
    self[checkboxName+'Wrap'].style.marginBottom='10px';
    self.container.appendChild(self[checkboxName+'Wrap']);
    self[checkboxName+'Input'].addEventListener('change',function () {
      self.concatData(self);
      //拼好数据 送去 value方法 不要放一起





      // self.setJsonValue(name,self);
    });


  },
  createRegistryItem: function(self,isFirst){
    var name ='registry';
    var labelName = '注册码';
    self[name+'Title'] =  self.theme.getFormInputLabel(labelName);
    self[name+'Input'] =  self.theme.getFormInputField('text');
    self[name+'Input'].classList.add(name);
    self[name+'Wrap'] = self.theme.getFormControl(self[name+'Title'],self[name+'Input']);
    self.container.appendChild(self[name+'Wrap']);
    self.destroyOtherItems(name,self,isFirst);
    self[name+'Input'].addEventListener('change',function () {
      // self.setJsonValue(name,self);
      self.concatData(self);
    });

    var keyName ='registryKey';
    var keyLabelName = '秘钥';
    self[keyName+'Title'] =  self.theme.getFormInputLabel(keyLabelName);
    self[keyName+'Input'] =  self.theme.getFormInputField('text');
    self[keyName+'Wrap'] = self.theme.getFormControl(self[keyName+'Title'],self[keyName+'Input']);
    self.container.appendChild(self[keyName+'Wrap']);
    self[keyName+'Input'].addEventListener('change',function () {
      // self.setJsonValue(name,self);
      self.concatData(self);
    });



    var checkboxName ='resident';
    var checkboxLabelName = '后台常驻';
    self[checkboxName+'Title'] =  self.theme.getFormInputLabel(checkboxLabelName);
    self[checkboxName+'Input'] =  self.theme.getFormInputField('checkbox');
    self[checkboxName+'Input'].classList.add('checkResident');
    self[checkboxName+'Wrap'] = self.theme.getFormControl(self[checkboxName+'Title'],self[checkboxName+'Input']);
    self[checkboxName+'Wrap'].style.marginBottom='10px';
    self[checkboxName+'Wrap'].style.marginBottom='10px';
    self.container.appendChild(self[checkboxName+'Wrap']);
    self[checkboxName+'Input'].addEventListener('change',function () {
      self.concatData(self);
      //拼好数据 送去 value方法 不要放一起





      // self.setJsonValue(name,self);
    });
  },
  getItemData  :function (name,self) {
    var itemData , data={};
    if(name === 'root'){
      itemData = self.input.value;
    }else{
      itemData =name;
    }
    var cpnyItem = this.initSelectArr();
    var  items =  cpnyItem.filter(function (item) {
      return  item.name ===  itemData;
    })[0].items;

    data.id=itemData;
    items.map(function (changeItem) {
      var itemType = self[changeItem+'Input'].getAttribute('type');
      if(itemType === 'checkbox'){
        data[changeItem] = self[changeItem+'Input'].checked;
      }else{
        data[changeItem] = self[changeItem+'Input'].value;
      }
    });
      return data;
  },


  destroyOtherItems:function(activeItem,self,isFirst) {
    var cpnyItem = this.initSelectArr();
    var items = {};
    cpnyItem.map(function (item) {
      items[item.id] = [];
      items[item.id] = item.items.map(function (i) {
        return  i+'Wrap';
      });
    });


    if(!isFirst){

      for (var key in items){

        if(key !==activeItem){
          for (var Idx  in items[key]){


            if(self[items[key][Idx]] && self[items[key][Idx]].parentNode) self[items[key][Idx]].parentNode.removeChild(self[items[key][Idx]]);

          }

        }
      }

    }



  },
  refreshPreview: function() {

  },
  enable: function() {
    if(!this.always_disabled) {
      if(this.uploader) this.uploader.disabled = false;
      this._super();
    }
  },



  register: function() {
    this._super();
    if(!this.input) return;
    this.input.setAttribute('name',this.formname);

  },
  loopVal:'',
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    if(this.uploader) this.uploader.disabled = true;
    this._super();
  },
  setValue: function(val) {
    var self =  this;
    //根据传入的id进行创建ele模型。
    // 并更新数据
    if(val){
      val = JSON.parse(val);

      var setItem =  this.initSelectArr().filter(function (item) {
        return item.name === val.id;
     })[0];
      setItem.create(this,false);

      setItem.items.map(function (item) {
        var itemType = self[item+'Input'].type;
        if(val[item]){
          if(itemType === 'checkbox'){
            self[item+'Input'].checked = val[item];
          }else{
            self[item+'Input'].value = val[item];
          }
        }
      });
      self.input.value = val.id;
        this.value = JSON.stringify(val);
        this.onChange(true);
    }
    // if(this.value !== val&& val && this.loopVal!==this.value) {

    //   console.log(val)
    //   console.log(this.loopVal)
    //  this.loopVal=this.value
    //   // this.input.value = 1
    //   // this.refreshItem(val,self)
    //

    // }
  },
  refreshItem:function(val,self){
    if(val !=''){
      var data = {};
      var arr = this.initSelectArr();
      data.id = self.input.value;
      var changeItems = arr.filter(function (item) {
        return item.name===data.id;
      });

    }


  },
  destroy: function() {
    if(this.preview && this.preview.parentNode) this.preview.parentNode.removeChild(this.preview);
    if(this.title && this.title.parentNode) this.title.parentNode.removeChild(this.title);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    if(this.uploader && this.uploader.parentNode) this.uploader.parentNode.removeChild(this.uploader);

    this._super();
  }
});
