### json editor 自定义

## 拓展功能

### 必填
1、ui界面增加字符串、上传控件必填*提示

### 富文本编辑器
1. json editor富文本编辑器引用SCEDITOR插件，在此基础上默认增加了上传文件回调；
2. 配置上传回调后，拓展了插入pdf、视频、音频、本地图片这几个自定义指令，在初始化json editor时候，配置plugins.sceditor.toolbar可生效
eg:
```
JSONEditor.plugins.sceditor.toolbar = 'localimage,pdf|video,audio'
```
tips：后续需要从素材库中选择

### 上传
1. 自定义上传样式
2. 拓展可以关联引用配置了的节点上传，该节点的schema如果配置了quoteSelector引用字段，则可以关联数据，然后引用上传
eg: 一个字段的schema为： 
```
"cover": {
  "type": "string",
  "format": "url",
  "title": "封面",
  "options": {
    "upload": true,
    "quoteSelector": {
      "_nodePath": "/content/material/image",
      "schema": "material",
      "coverColumn": "url",
      "valueColumn": "url",
      "labelColumn": "name"
    }
  },
  "propertyOrder": 4
}
```
_nodePath： 节点路径；
schema：元数据名称；
coverColumn：封面字段；
valueColumn：引用值的字段；
labelColumn：显示文字字段；
