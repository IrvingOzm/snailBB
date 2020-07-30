JSONEditor.defaults.editors.upload = JSONEditor.AbstractEditor.extend({
  getNumColumns: function() {
    return 4;
  },
  build: function() {
    var self = this;
    this.title = this.header = this.label = this.theme.getFormInputLabel(
      this.getTitle()
    );
    /**
     * 必填加*号提示
     * ouziming
     */
    if (
      (this.schema.minLength && this.schema.minLength >= 1) ||
      (this.jsoneditor.schema.required &&
        this.jsoneditor.schema.required.indexOf(this.key) > -1)
    ) {
      if (!this.options.compact)
        this.title = this.header = this.label = this.theme.getFormRequiredInputLabel(
          this.getTitle()
        );
    } else {
      if (!this.options.compact)
        this.title = this.header = this.label = this.theme.getFormInputLabel(
          this.getTitle()
        );
    }

    // Input that holds the base64 string
    this.input = this.theme.getFormInputField('hidden');

    // Don't show uploader if this is readonly
    if (!this.schema.readOnly && !this.schema.readonly) {
      if (!this.jsoneditor.options.upload)
        throw 'Upload handler required for upload editor';

      // File uploader
      /**
       * TODO
       * 1. 美化上传按钮的样式； 方式：隐藏真实的上传按钮，用label代替
       * 2. 根据关联素材节点，引用该节点数据上传
       * @author ouziming@cvte.com 2019/11/21
       */
      this.uploader = this.theme.getFormInputField('file');
      var buttonLabel = this.theme.getFakeFileInput('本地上传');
      this.uploaderWrap = document.createElement('div');
      buttonLabel.setAttribute('for', this.options.path);
      this.uploader.setAttribute('id', this.options.path);
      this.uploader.style.width = this.uploader.style.height = '0.1px';
      this.uploader.style.opacity = '0';
      this.uploader.style.overflow = 'hidden';
      this.uploader.style.position = 'absolute';
      this.uploader.style['z-index'] = '-1';
      /**
       * TODO
       * 对json-shcema上传类型做检验
       */
      var type = this.schema.options.type;
      if (type) {
        var acceptList = [];
        var acceptMap = {
          image: 'image/png,image/jpeg,image/gif,image/jpg',
          video: 'video/*',
          audio: 'audio/*',
          pdf: 'application/pdf'
        };
        for (var acceptKey in acceptMap) {
          if (type.indexOf(acceptKey) > -1) {
            acceptList.push(acceptMap[acceptKey]);
          }
        }
        var acceptTypes = acceptList.join(',');
        this.uploader.accept = acceptTypes;
      }

      // 关联外部上传
      if (
        this.options &&
        this.options.quoteSelector &&
        this.options.quoteSelector.schema
      ) {
        this.quoteSelectorButton = this.theme.getFakeFileInput(
          this.options.quoteSelector.buttonLabel || '素材库'
        );
        this.quoteSelectorButton.setAttribute('data-path', this.path);

        // 关联外部节点上传回调注册
        this.quoteSelectorButton.addEventListener('click', function(event) {
          event.preventDefault();

          var props = {
            _nodePath: self.options.quoteSelector._nodePath,
            schema: self.options.quoteSelector.schema,
            value: self.options.quoteSelector.valueColumn,
            label: self.options.quoteSelector.labelColumn,
            cover: self.options.quoteSelector.coverColumn
          };
          self.jsoneditor.options.quoteUpload(self.path, props, {
            success: function(url) {
              self.setValue(url);

              if (self.parent) self.parent.onChildEditorChange(self);
              else self.jsoneditor.onChange();
              self.preview.innerHTML = '';
              self.preview_value = url;
              // self.refreshPreview(url);
            },
            clear: function() {
              console.log(self.getValue());
            }
          });
        });
      }

      this.uploaderWrap.appendChild(this.uploader);
      this.uploaderWrap.appendChild(buttonLabel);
      if (this.quoteSelectorButton)
        this.uploaderWrap.appendChild(this.quoteSelectorButton);
      this.uploaderWrap.className = 'uploader-wrap';

      this.uploader.addEventListener('change', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.files && this.files.length) {
          /**
           * 大文件不read
           * 大文件使用fileReader读取，导致页面卡顿
           * ouziming 2020-07-30
           */
          if (this.files[0].size < 150000000) {
            var fr = new FileReader();
            fr.onload = function(evt) {
              self.preview_value = evt.target.result;
              self.refreshPreview();
              self.onChange(true);
              fr = null;
            };
            fr.readAsDataURL(this.files[0]);
          } else {
            self.preview_value = new Date().getTime() + '';
            self.refreshPreview();
            self.onChange(true);
          }
        }
      });
    }

    var description = this.schema.description;
    if (!description) description = '';

    this.preview = this.theme.getFormInputDescription(description);
    this.container.appendChild(this.preview);

    this.control = this.theme.getFormControl(
      this.label,
      this.uploaderWrap || this.uploader || this.input,
      this.preview
    );
    this.container.appendChild(this.control);

    window.requestAnimationFrame(function() {
      if (self.value) {
        var img = document.createElement('img');
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100px';
        img.onload = function(event) {
          self.preview.appendChild(img);
        };
        img.onerror = function(error) {
          console.error('upload error', error);
        };
        img.src = self.value;
      }
    });
  },
  refreshPreview: function() {
    if (this.last_preview === this.preview_value) return;
    this.last_preview = this.preview_value;

    this.preview.innerHTML = '';

    var file = this.uploader && this.uploader.files[0];

    // 大文件event.target.result为空
    // ouziming 2020-04-14
    if (
      (!this.preview_value && !file) ||
      (!this.preview_value && file.size < 100000000)
    )
      return;

    var self = this;

    var mime = this.preview_value.match(/^data:([^;,]+)[;,]/);
    if (mime) mime = mime[1];
    if (!mime) mime = file.type || 'unknown';

    this.preview.innerHTML =
      '<strong>格式:</strong> ' +
      mime +
      ', <strong>文件大小:</strong> ' +
      file.size +
      ' bytes';
    if (mime.substr(0, 5) === 'image') {
      this.preview.innerHTML += '<br>';
      var img = document.createElement('img');
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100px';
      img.src = this.preview_value;
      this.preview.appendChild(img);
    }

    this.preview.innerHTML += '<br>';
    var uploadButton = this.getButton('Upload', 'upload', 'Upload');
    this.preview.appendChild(uploadButton);
    uploadButton.addEventListener('click', function(event) {
      event.preventDefault();

      uploadButton.setAttribute('disabled', 'disabled');
      self.theme.removeInputError(self.uploader);

      if (self.theme.getProgressBar) {
        self.progressBar = self.theme.getProgressBar();
        self.preview.appendChild(self.progressBar);
      }

      self.jsoneditor.options.upload(self.path, file, {
        success: function(url) {
          self.setValue(url);

          if (self.parent) self.parent.onChildEditorChange(self);
          else self.jsoneditor.onChange();

          if (self.progressBar) self.preview.removeChild(self.progressBar);
          uploadButton.removeAttribute('disabled');
        },
        failure: function(error) {
          self.theme.addInputError(self.uploader, error);
          if (self.progressBar) self.preview.removeChild(self.progressBar);
          uploadButton.removeAttribute('disabled');
        },
        updateProgress: function(progress) {
          if (self.progressBar) {
            if (progress)
              self.theme.updateProgressBar(self.progressBar, progress);
            else self.theme.updateProgressBarUnknown(self.progressBar);
          }
        }
      });
    });

    if (
      this.jsoneditor.options.auto_upload ||
      this.schema.options.auto_upload
    ) {
      uploadButton.dispatchEvent(new MouseEvent('click'));
      this.preview.removeChild(uploadButton);
    }
  },
  enable: function() {
    if (!this.always_disabled) {
      if (this.uploader) this.uploader.disabled = false;
      this._super();
    }
  },
  disable: function(always_disabled) {
    if (always_disabled) this.always_disabled = true;
    if (this.uploader) this.uploader.disabled = true;
    this._super();
  },
  setValue: function(val) {
    if (this.value !== val) {
      this.value = val;
      this.input.value = this.value;
      this.onChange();
    }
  },
  destroy: function() {
    if (this.preview && this.preview.parentNode)
      this.preview.parentNode.removeChild(this.preview);
    if (this.title && this.title.parentNode)
      this.title.parentNode.removeChild(this.title);
    if (this.input && this.input.parentNode)
      this.input.parentNode.removeChild(this.input);
    if (this.uploader && this.uploader.parentNode)
      this.uploader.parentNode.removeChild(this.uploader);

    this._super();
  }
});
