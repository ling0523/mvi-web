<template>
    <m-overlay :color="toastOverlayColor" @hidden="toastHidden" :show="show" :use-padding="toastUsePadding" :zIndex="toastZIndex" :local="toastLocal" fade>
        <div :class="['mvi-toast',toastMessage?'':'mvi-toast-iconless']" :style="toastStyle" v-on="listeners">
            <div class="mvi-toast-icon">
                <m-loading :color="toastColor || '#fff'" v-if="toastType=='loading' && (!toastIcon.type && !toastIcon.url)" :type="0" :size="toastIcon.size" />
                <m-icon v-else :type="toastIcon.type" :url="toastIcon.url" :spin="toastIcon.spin" :size="toastIcon.size" :color="toastIcon.color" />
            </div>
            <div v-if="toastMessage" class="mvi-toast-message" v-html="toastMessage"></div>
        </div>
    </m-overlay>
</template>

<script>
import $dap from 'dap-util'
import mOverlay from '../overlay/overlay'
import mLoading from '../loading/loading'
import mIcon from '../icon/icon'
export default {
    name: 'm-toast',
    data() {
        return {
            show: false,
            //计数
            amounts: 0,
            //计时器
            timers: [],
            typeArray: ['success', 'error', 'loading', 'info'],
            //弹窗类型，取值为success/error/loading/info
            type: null,
            //显示文本
            message: null,
            //弹窗自动关闭的时间，默认不自动关闭
            timeout: null,
            //遮罩层颜色
            overlayColor: null,
            //弹窗背景色
            background: null,
            //弹窗字体颜色
            color: null,
            //z-index
            zIndex: null,
            //回调函数
            callback: null,
            //是否局部
            local: null,
            //是否考虑右内边距
            usePadding: null,
            //自定义显示的图标
            icon: null,
            //图标大小
            size: null
        }
    },
    computed: {
        listeners() {
            return Object.assign({}, this.$listeners)
        },
        toastUsePadding() {
            if (typeof this.usePadding == 'boolean') {
                return this.usePadding
            } else {
                return false
            }
        },
        toastType() {
            if (this.typeArray.includes(this.type)) {
                return this.type
            } else {
                return 'info'
            }
        },
        toastIcon() {
            //默认图标
            let icon = {
                type: this.defaultIconType,
                url: null,
                spin: false,
                size: '0.72rem',
                color: null
            }
            if (typeof this.icon == 'string' && this.icon) {
                icon.type = this.icon
            } else if ($dap.common.isObject(this.icon)) {
                if (typeof this.icon.type == 'string' && this.icon.type) {
                    icon.type = this.icon.type
                }
                if (typeof this.icon.url == 'string' && this.icon.url) {
                    icon.url = this.icon.url
                }
                if (typeof this.icon.spin == 'boolean') {
                    icon.spin = this.icon.spin
                }
                if (typeof this.icon.size == 'string' && this.icon.size) {
                    icon.size = this.icon.size
                }
                if (typeof this.icon.color == 'string' && this.icon.color) {
                    icon.color = this.icon.color
                }
            }
            return icon
        },
        toastMessage() {
            if (typeof this.message == 'string') {
                return this.message
            } else if ($dap.common.isObject(this.message)) {
                return JSON.stringify(this.message)
            } else {
                return String(this.message)
            }
        },
        toastTimeout() {
            if ($dap.number.isNumber(this.timeout) && this.timeout > 0) {
                return this.timeout
            } else {
                return -1
            }
        },
        toastCallback() {
            if (typeof this.callback == 'function') {
                return this.callback
            } else {
                return function () {}
            }
        },
        toastZIndex() {
            if ($dap.number.isNumber(this.zIndex)) {
                return this.zIndex
            } else {
                return 1100
            }
        },
        toastLocal() {
            if (
                (typeof this.local == 'string' && this.local) ||
                $dap.element.isElement(this.local)
            ) {
                return true
            } else {
                return false
            }
        },
        toastOverlayColor() {
            if (typeof this.overlayColor == 'string' && this.overlayColor) {
                return this.overlayColor
            } else {
                return 'rgba(0, 10, 20, .05)'
            }
        },
        toastBackground() {
            if (typeof this.background == 'string' && this.background) {
                return this.background
            } else {
                return null
            }
        },
        toastColor() {
            if (typeof this.color == 'string' && this.color) {
                return this.color
            } else {
                return null
            }
        },
        toastStyle() {
            let style = {}
            style.zIndex = this.toastZIndex
            if (this.toastBackground) {
                style.backgroundColor = this.toastBackground
            }
            if (this.toastColor) {
                style.color = this.toastColor
            }
            return style
        },
        defaultIconType() {
            if (this.toastType == 'success') {
                return 'success'
            } else if (this.toastType == 'error') {
                return 'error-o'
            } else if (this.toastType == 'info') {
                return 'info-o'
            } else if (this.toastType == 'loading') {
                return null
            }
        }
    },
    watch: {
        amounts(newValue) {
            if (this.toastTimeout > 0) {
                let timer = setTimeout(() => {
                    this.show = false
                }, this.toastTimeout)
                this.timers.push(timer)
            }
        }
    },
    components: {
        mOverlay,
        mIcon,
        mLoading
    },
    methods: {
        //toast完全关闭后触发的方法
        toastHidden() {
            //移除元素
            this.$el.remove()
            this.clearTimer()
            //回调
            this.toastCallback()
        },
        //清除所有的计时器
        clearTimer() {
            this.timers.forEach(item => {
                clearTimeout(item)
            })
            this.timers = []
        }
    }
}
</script>

<style scoped lang="less">
@import '../../css/mvi-basic.less';

.mvi-toast {
    display: flex;
    display: -webkit-flex;
    justify-content: flex-start;
    flex-direction: column;
    -ms-flex-direction: column;
    -webkit-flex-direction: column;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    width: 3rem;
    margin: 0;
    padding: @mp-md;
    border-radius: @radius-default;
    box-shadow: @boxshadow;
    -webkit-box-shadow: @boxshadow;
    background-color: rgba(0, 0, 0, 0.85);
    color: #fff;

    &.mvi-toast-iconless {
        justify-content: center;
        align-items: center;
        padding: 0;
        width: 2.4rem;
        height: 1.8rem;
    }
}

.mvi-toast-icon {
    display: flex;
    display: -webkit-flex;
    justify-content: center;
    align-items: center;
    width: 100%;
}

.mvi-toast-message {
    display: block;
    width: 100%;
    text-align: center;
    font-size: @font-size-default;
    margin-top: @mp-sm;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>
