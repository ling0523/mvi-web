import $dap from 'dap-util'
/**
 * 文件上传
 */
class Upload {
    constructor(element, options) {
        //组件容器
        this.$el = element
        //文件上传元素
        this.$selectInput = null
        //选择的文件值数组
        this.files = []
        if (!$dap.common.isObject(options)) {
            options = {}
        }
        //接受的文件类型
        this.accept = options.accept
        //是否直接使用摄像头或者麦克风，只有在accept为image或者video或者audio时有效
        this.capture = options.capture
        //限定上传文件的后缀
        this.allowedFileType = options.allowedFileType
        //上传文件的最小值
        this.minSize = options.minSize
        //上传文件的最大值
        this.maxSize = options.maxSize
        //上传文件的最大个数
        this.maxLength = options.maxLength
        //上传文件的最小个数
        this.minLength = options.minLength
        //是否多选
        this.multiple = options.multiple
        //选择的文件是否追加
        this.append = options.append
        //选择文件错误触发的回调函数
        this.error = options.error
        //选择文件成功后触发的回调函数
        this.select = options.select
        //是否禁用
        this.disabled = options.disabled
        //加载完毕触发的回调函数
        this.ready = options.ready
        //额外的参数
        this.extra = options.extra
        //是否初始化
        this.hasInit = false
    }

    //初始化
    init() {
        if (this.hasInit) {
            return
        }
        this.hasInit = true
        if (!$dap.element.isElement(this.$el)) {
            throw new TypeError('The upload element is not specified')
        }
        if (!(this.allowedFileType instanceof Array)) {
            this.allowedFileType = []
        }
        if (!$dap.number.isNumber(this.minSize) || this.minSize <= 0) {
            this.minSize = -1
        }
        if (!$dap.number.isNumber(this.maxSize) || this.maxSize <= 0) {
            this.maxSize = -1
        }
        if (!$dap.number.isNumber(this.maxLength) || this.maxLength <= 0) {
            this.maxLength = -1
        }
        if (!$dap.number.isNumber(this.minLength) || this.minLength <= 0) {
            this.minLength = -1
        }
        if (typeof this.multiple != 'boolean') {
            this.multiple = false
        }
        if (typeof this.capture != 'boolean') {
            this.capture = false
        }
        if (typeof this.append != 'boolean') {
            this.append = false
        }
        if (typeof this.disabled != 'boolean') {
            this.disabled = false
        }
        if (typeof this.error != 'function') {
            this.error = function() {}
        }
        if (typeof this.select != 'function') {
            this.select = function() {}
        }
        if (typeof this.ready != 'function') {
            this.ready = function() {}
        }
        if (typeof this.extra != 'object') {
            this.extra = {}
        }
        //生成input[type='file']元素
        this.$selectInput = $dap.element.string2dom("<input type='file' />")
        if (this.accept === 'rar') {
            this.$selectInput.setAttribute(
                'accept',
                'application/x-rar-compressed'
            )
        } else if (this.accept === 'zip') {
            this.$selectInput.setAttribute(
                'accept',
                'application/x-zip-compressed'
            )
        } else if (this.accept === 'txt') {
            this.$selectInput.setAttribute('accept', 'text/plain')
        } else if (this.accept === 'image') {
            this.$selectInput.setAttribute('accept', 'image/*')
            if (this.capture) {
                this.$selectInput.setAttribute('capture', 'camera')
            }
        } else if (this.accept === 'video') {
            this.$selectInput.setAttribute('accept', 'video/*')
            if (this.capture) {
                this.$selectInput.setAttribute('capture', 'camcorder')
            }
        } else if (this.accept === 'audio') {
            this.$selectInput.setAttribute('accept', 'aduio/*')
        } else if (this.accept === 'html') {
            this.$selectInput.setAttribute('accept', 'text/html')
        } else if (this.accept === 'doc') {
            this.$selectInput.setAttribute('accept', 'application/msword')
        } else if (this.accept === 'xml') {
            this.$selectInput.setAttribute('accept', 'text/xml')
        } else if (this.accept === 'js') {
            this.$selectInput.setAttribute('accept', 'text/javascript')
        } else if (this.accept === 'json') {
            this.$selectInput.setAttribute('accept', 'application/json')
        } else if (this.accept === 'ppt') {
            this.$selectInput.setAttribute(
                'accept',
                'application/vnd.ms-powerpoint'
            )
        } else if (this.accept === 'pdf') {
            this.$selectInput.setAttribute('accept', 'application/pdf')
        }

        if (this.multiple) {
            this.$selectInput.setAttribute('multiple', 'multiple')
        }
        if (this.disabled) {
            this.$el.setAttribute('disabled', 'disabled')
        }
        this.$el.onclick = e => {
            if (this.disabled) {
                return
            }
            this.$selectInput.click()
        }

        this.$selectInput.onchange = e => {
            if (this.disabled) {
                return
            }
            let files = [...this.$selectInput.files]
            this.$selectInput.value = ''
            //选择的文件不追加，则清空文件数组
            if (!this.append) {
                this.files = []
            }
            let length = files.length
            let isAllAccord = true
            for (let i = 0; i < length; i++) {
                //判断后缀
                if (!this._judgeSuffix(files[i].name)) {
                    this.error.apply(this, [
                        Upload.ERRORTYPE.FILE_SUFFIX_ERROR,
                        '文件' + files[i].name + '不符合规定的文件后缀类型',
                        files[i]
                    ])
                    isAllAccord = false
                    break
                }
                //超出文件最大值
                if (files[i].size / 1024 > this.maxSize && this.maxSize > 0) {
                    this.error.apply(this, [
                        Upload.ERRORTYPE.FILE_MAXSIZE_ERROR,
                        '文件' + files[i].name + '超出文件最大值限定',
                        files[i]
                    ])
                    isAllAccord = false
                    break
                }
                //没有达到最小值
                if (files[i].size / 1024 < this.minSize && this.minSize > 0) {
                    this.error.apply(this, [
                        Upload.ERRORTYPE.FILE_MINSIZE_ERROR,
                        '文件' + files[i].name + '没有达到文件最小值限定',
                        files[i]
                    ])
                    isAllAccord = false
                    break
                }
                //超出最大数量限制
                if (
                    this.files.length + length > this.maxLength &&
                    this.maxLength > 0
                ) {
                    this.error.apply(this, [
                        Upload.ERRORTYPE.FILE_MAXLENGTH_ERROR,
                        '文件数量超出限定的最大值'
                    ])
                    isAllAccord = false
                    break
                }
            }
            //条件未通过
            if (!isAllAccord) {
                return
            }
            //文件数量没有达到最小值
            if (
                this.files.length + length < this.minLength &&
                this.minLength > 0
            ) {
                this.error.apply(this, [
                    Upload.ERRORTYPE.FILE_MINLENGTH_ERROR,
                    '文件数量没有达到限定的最小值'
                ])
                return
            }
            this.files = [...this.files, ...files]
            this.select.apply(this, [[...this.files], { ...this.extra }])
        }

        //ready
        this.ready.apply(this, [this])
    }

    //判断选择的文件是否符合规定的后缀格式
    _judgeSuffix(fileName) {
        //获取文件后缀
        let suffix = fileName.substr(fileName.lastIndexOf('.') + 1)
        if (this.allowedFileType.length == 0) {
            return true
        } else {
            suffix = suffix.toLocaleLowerCase() //转为小写
            for (let i = 0; i < this.allowedFileType.length; i++) {
                this.allowedFileType[i] = this.allowedFileType[
                    i
                ].toLocaleLowerCase()
            }
            return this.allowedFileType.includes(suffix)
        }
    }

    //获取已经选择的文件
    getFiles() {
        return {
            files: [...this.files],
            extra: { ...this.extra }
        }
    }

    //清空选择的文件
    clear() {
        this.files = []
        this.$selectInput.value = ''
        this.select.apply(this, [[...this.files], { ...this.extra }])
    }

    //禁用
    setDisabled() {
        this.disabled = true
        this.$el.setAttribute('disabled', 'disabled')
    }

    //启用
    setEnabled() {
        this.disabled = false
        this.$el.removeAttribute('disabled')
    }
}

Upload.ERRORTYPE = {
    //文件后缀不符合
    FILE_SUFFIX_ERROR: 101,
    //超出最大文件尺寸限制
    FILE_MAXSIZE_ERROR: 102,
    //文件尺寸没有达到要求的最小值
    FILE_MINSIZE_ERROR: 103,
    //文件数量超出限制
    FILE_MAXLENGTH_ERROR: 104,
    //文件数量没有达到最小值
    FILE_MINLENGTH_ERROR: 105
}

export default Upload
