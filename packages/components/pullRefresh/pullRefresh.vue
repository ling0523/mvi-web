<template>
    <div class="mvi-pull-refresh" v-on="listeners">
        <div ref="wrapper" class="mvi-pull-refresh-wrapper" @touchstart="startPull" @touchmove="onPull" @touchend="pulled" @mousedown="startPull2" :style="wrapperStyle">
            <div ref="el" class="mvi-pull-refresh-el" :style="elStyle">
                <slot name="el" v-if="$scopedSlots.el" :status="status"></slot>
                <m-icon v-if="!$scopedSlots.el" :type="icon.type" :spin="icon.spin" :url="icon.url" :size="icon.size" :color="icon.color" />
                <span v-if="!$scopedSlots.el" class="mvi-pull-refresh-text" v-text="message"></span>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
import $dap from 'dap-util'
import mIcon from '../icon/icon'
export default {
    name: 'm-pull-refresh',
    data() {
        return {
            //刷新元素高度
            elHeight: 0,
            //计数点
            amount: 0,
            //计数点最大值
            amountMax: 4,
            //垂直起点
            startY: 0,
            //第一次垂直起点
            firstStartY: 0,
            //0表示还没触发下拉，1表示触发下拉了但是还没松手，2表示已经松手正在刷新
            status: 0,
            //垂直偏移距离
            translateY: 0,
            //是否触摸行为导致下拉刷新
            hasTouch: false,
            //是否按下鼠标了
            mouseDown: false,
            //是否禁用滚动条
            disableScroll: false
        }
    },
    model: {
        prop: 'refresh',
        event: 'model-change'
    },
    props: {
        //下拉文案
        pullingText: {
            type: String,
            default: '下拉刷新'
        },
        //释放文案
        loosingText: {
            type: String,
            default: '释放刷新'
        },
        //刷新时显示的文本
        loadingText: {
            type: String,
            default: '正在刷新'
        },
        //是否刷新
        refresh: {
            type: Boolean,
            default: false
        },
        //下拉图标
        pullingIcon: {
            type: [String, Object],
            default: null
        },
        //释放可刷新时图标
        loosingIcon: {
            type: [String, Object],
            default: null
        },
        //刷新时图标
        loadingIcon: {
            type: [String, Object],
            default: null
        },
        //是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        //颜色
        color: {
            type: String,
            default: null
        },
        //下拉文案颜色
        pullingColor: {
            type: String,
            default: null
        },
        //释放文案颜色
        loosingColor: {
            type: String,
            default: null
        },
        //刷新文案颜色
        loadingColor: {
            type: String,
            default: null
        },
        //下拉触发刷新的距离值
        distance: {
            type: Number,
            default: 1.4
        }
    },
    computed: {
        listeners() {
            return Object.assign({}, this.$listeners)
        },
        wrapperStyle() {
            let style = {}
            style.height = `calc(100% + ${this.elHeight}px)`
            style.transform = `translateY(${this.translateY}px)`
            if (this.disableScroll) {
                style.overflowY = 'hidden'
            }
            return style
        },
        elStyle() {
            let style = {}
            if (this.color) {
                style.color = this.color
            }
            if (this.pullingColor && this.status == 0) {
                style.color = this.pullingColor
            } else if (this.loosingColor && this.status == 1) {
                style.color = this.loosingColor
            } else if (this.loadingColor && this.status == 2) {
                style.color = this.loadingColor
            }
            return style
        },
        icon() {
            if (this.status == 0) {
                return {
                    type: this.pullingIconType,
                    spin: this.pullingIconSpin,
                    url: this.pullingIconUrl,
                    size: this.pullingIconSize,
                    color: this.pullingIconColor
                }
            } else if (this.status == 1) {
                return {
                    type: this.loosingIconType,
                    spin: this.loosingIconSpin,
                    url: this.loosingIconUrl,
                    size: this.loosingIconSize,
                    color: this.loosingIconColor
                }
            } else if (this.status == 2) {
                return {
                    type: this.loadingIconType,
                    spin: this.loadingIconSpin,
                    url: this.loadingIconUrl,
                    size: this.loadingIconSize,
                    color: this.loadingIconColor
                }
            }
        },
        message() {
            if (this.status == 0) {
                return this.pullingText
            } else if (this.status == 1) {
                return this.loosingText
            } else if (this.status == 2) {
                return this.loadingText
            }
        },
        pullingIconType() {
            let type = 'arrow-down'
            if ($dap.common.isObject(this.pullingIcon)) {
                if (typeof this.pullingIcon.type == 'string') {
                    type = this.pullingIcon.type
                }
            } else if (typeof this.pullingIcon == 'string') {
                type = this.pullingIcon
            }
            return type
        },
        pullingIconUrl() {
            let url = null
            if ($dap.common.isObject(this.pullingIcon)) {
                if (typeof this.pullingIcon.url == 'string') {
                    url = this.pullingIcon.url
                }
            }
            return url
        },
        pullingIconSpin() {
            let spin = false
            if ($dap.common.isObject(this.pullingIcon)) {
                if (typeof this.pullingIcon.spin == 'boolean') {
                    spin = this.pullingIcon.spin
                }
            }
            return spin
        },
        pullingIconSize() {
            let size = null
            if ($dap.common.isObject(this.pullingIcon)) {
                if (typeof this.pullingIcon.size == 'string') {
                    size = this.pullingIcon.size
                }
            }
            return size
        },
        pullingIconColor() {
            let color = null
            if ($dap.common.isObject(this.pullingIcon)) {
                if (typeof this.pullingIcon.color == 'string') {
                    color = this.pullingIcon.color
                }
            }
            return color
        },
        loosingIconType() {
            let type = 'arrow-up'
            if ($dap.common.isObject(this.loosingIcon)) {
                if (typeof this.loosingIcon.type == 'string') {
                    type = this.loosingIcon.type
                }
            } else if (typeof this.loosingIcon == 'string') {
                type = this.loosingIcon
            }
            return type
        },
        loosingIconUrl() {
            let url = null
            if ($dap.common.isObject(this.loosingIcon)) {
                if (typeof this.loosingIcon.url == 'string') {
                    url = this.loosingIcon.url
                }
            }
            return url
        },
        loosingIconSpin() {
            let spin = false
            if ($dap.common.isObject(this.loosingIcon)) {
                if (typeof this.loosingIcon.spin == 'boolean') {
                    spin = this.loosingIcon.spin
                }
            }
            return spin
        },
        loosingIconSize() {
            let size = null
            if ($dap.common.isObject(this.loosingIcon)) {
                if (typeof this.loosingIcon.size == 'string') {
                    size = this.loosingIcon.size
                }
            }
            return size
        },
        loosingIconColor() {
            let color = null
            if ($dap.common.isObject(this.loosingIcon)) {
                if (typeof this.loosingIcon.color == 'string') {
                    color = this.loosingIcon.color
                }
            }
            return color
        },
        loadingIconType() {
            let type = 'load-e'
            if ($dap.common.isObject(this.loadingIcon)) {
                if (typeof this.loadingIcon.type == 'string') {
                    type = this.loadingIcon.type
                }
            } else if (typeof this.loadingIcon == 'string') {
                type = this.loadingIcon
            }
            return type
        },
        loadingIconUrl() {
            let url = null
            if ($dap.common.isObject(this.loadingIcon)) {
                if (typeof this.loadingIcon.url == 'string') {
                    url = this.loadingIcon.url
                }
            }
            return url
        },
        loadingIconSpin() {
            let spin = true
            if ($dap.common.isObject(this.loadingIcon)) {
                if (typeof this.loadingIcon.spin == 'boolean') {
                    spin = this.loadingIcon.spin
                }
            }
            return spin
        },
        loadingIconSize() {
            let size = null
            if ($dap.common.isObject(this.loadingIcon)) {
                if (typeof this.loadingIcon.size == 'string') {
                    size = this.loadingIcon.size
                }
            }
            return size
        },
        loadingIconColor() {
            let color = null
            if ($dap.common.isObject(this.loadingIcon)) {
                if (typeof this.loadingIcon.color == 'string') {
                    color = this.loadingIcon.color
                }
            }
            return color
        }
    },
    components: {
        mIcon
    },
    mounted() {
        //设置元素高度
        this.elHeight = this.$refs.el.offsetHeight
        //设置初始的偏移值
        this.translateY = -this.elHeight
        $dap.event.on(
            document.body,
            `mousemove.pullRefresh_${this._uid}`,
            this.onPull2
        )
        $dap.event.on(
            document.body,
            `mouseup.pullRefresh_${this._uid}`,
            this.pulled2
        )
    },
    watch: {
        refresh(newValue) {
            this.changeStatus()
        }
    },
    methods: {
        //开始下拉(移动端)
        startPull(event) {
            if (this.disabled) {
                return
            }
            if (this.status == 0) {
                this.startY = event.targetTouches[0].pageY //元素按下时的位置
                this.firstStartY = this.startY //元素按下的位置，此数值不会变更
            }
        },
        //开始下拉(PC端)
        startPull2(event) {
            if (this.disabled) {
                return
            }
            if (this.status == 0) {
                this.mouseDown = true
                this.startY = event.pageY //元素按下时的位置
                this.firstStartY = this.startY //元素按下的位置，此数值不会变更
            }
        },
        //下拉过程(移动端)
        onPull(event) {
            if (this.disabled) {
                return
            }
            //加载状态下禁用
            if (this.status == 2) {
                return
            }
            let endY = event.targetTouches[0].pageY
            let move = endY - this.startY //每一次移动的偏移量
            let totalMove = endY - this.firstStartY //距离第一次触摸时的偏移量
            this.startY = endY
            //总偏移量小于0为手指向上滑动，元素向下滚动，不执行刷新
            if (totalMove <= 0) {
                this.firstStartY = this.startY
                return
            }
            //滚动条不在顶部时不执行刷新
            if ($dap.element.getScrollTop(this.$refs.wrapper) > 0) {
                this.firstStartY = this.startY
                return
            }
            //内部含有滚动条元素且滚动条不在顶部时阻塞
            let el = this.getScrollEl(event.target)
            if (el != this.$refs.wrapper && $dap.element.getScrollTop(el) > 0) {
                this.firstStartY = this.startY
                return
            }

            this.hasTouch = true

            if (event.cancelable) {
                event.preventDefault()
            }
            //当计数小于最大计数量时，每次移动计数+1
            if (this.amount < this.amountMax) {
                this.amount++
            }
            //元素偏移值
            let y = this.translateY + move / this.amount
            //如果移动距离大于distance指定的距离，则变为可释放状态
            if (y > $dap.element.rem2px(this.distance) - this.elHeight) {
                this.status = 1
            } else {
                this.status = 0
            }
            //改变元素位置
            this.translateY = y
        },
        //下拉过程(PC端)
        onPull2(event) {
            if (!this.mouseDown || this.disabled) {
                return
            }
            //加载状态下禁用
            if (this.status == 2) {
                return
            }
            let endY = event.pageY
            let move = endY - this.startY //每一次移动的偏移量
            let totalMove = endY - this.firstStartY //距离第一次触摸时的偏移量
            this.startY = endY

            //总偏移量小于0为向上滑动，元素向下滚动，不执行刷新
            if (totalMove <= 0) {
                this.firstStartY = this.startY
                return
            }
            //滚动条不在顶部时不执行刷新
            if ($dap.element.getScrollTop(this.$refs.wrapper) > 0) {
                this.firstStartY = this.startY
                return
            }
            //内部含有滚动条元素且滚动条不在顶部时阻塞
            let el = this.getScrollEl(event.target)
            if (el != this.$refs.wrapper && $dap.element.getScrollTop(el) > 0) {
                this.firstStartY = this.startY
                return
            }
            this.hasTouch = true

            if (event.cancelable) {
                event.preventDefault()
            }

            //当计数小于最大计数量时，每次移动计数+1
            if (this.amount < this.amountMax) {
                this.amount++
            }
            //元素移动距离
            let y = this.translateY + move / this.amount

            //如果移动距离大于distance指定的距离，则变为可释放状态
            if (y > $dap.element.rem2px(this.distance) - this.elHeight) {
                this.status = 1
            } else {
                this.status = 0
            }
            //改变元素位置
            this.translateY = y
        },
        //下拉结束释放(移动端)
        pulled(event) {
            if (this.disabled) {
                return
            }
            //当下拉结束时，判断状态是否为释放可加载状态，如果是，则更改refresh值，变为加载状态
            if (this.status == 1 && this.refresh == false) {
                this.$emit('model-change', true)
                this.$emit('update:refresh', true)
            } else if (this.status == 0) {
                this.changeStatus()
            }
        },
        //下拉结束释放(PC端)
        pulled2(event) {
            if (!this.mouseDown || this.disabled) {
                return
            }
            this.mouseDown = false
            //当下拉结束时，判断状态是否为释放可加载状态，如果是，则更改refresh值，变为加载状态
            if (this.status == 1 && this.refresh === false) {
                this.$emit('model-change', true)
                this.$emit('update:refresh', true)
            } else if (this.status == 0) {
                this.changeStatus()
            }
        },
        //根据refresh的值改变状态
        changeStatus() {
            if (this.disabled) {
                return
            }
            //refresh值为true时状态变为加载状态
            if (this.refresh) {
                this.status = 2
                this.disableScroll = true
                this.$emit('refresh')
                //非触摸下拉的
                if (!this.hasTouch) {
                    this.$refs.wrapper.style.transition = 'transform 300ms'
                    this.$refs.wrapper.style.webkitTransition =
                        'transform 300ms'
                    //触发浏览器重绘刷新
                    const width = this.$refs.wrapper.offsetWidth
                    this.translateY =
                        $dap.element.rem2px(this.distance) - this.elHeight
                    setTimeout(() => {
                        this.$refs.wrapper.style.transition = ''
                        this.$refs.wrapper.style.webkitTransition = ''
                    }, 300)
                }
            }
            //refresh值为false时状态变为下拉前状态，数据恢复初始化
            else {
                this.amount = 0
                this.hasTouch = false
                this.$refs.wrapper.style.transition = 'transform 300ms'
                this.$refs.wrapper.style.webkitTransition = 'transform 300ms'
                //触发浏览器重绘刷新
                const width = this.$refs.wrapper.offsetWidth
                this.translateY = -this.elHeight
                setTimeout(() => {
                    this.$refs.wrapper.style.transition = ''
                    this.$refs.wrapper.style.webkitTransition = ''
                    this.status = 0
                    this.disableScroll = false
                }, 300)
            }
        },
        //获取触摸元素最近的滚动容器
        getScrollEl(el) {
            if (el === this.$refs.wrapper) {
                return this.$refs.wrapper
            }
            if ($dap.element.getScrollHeight(el) > el.clientHeight) {
                return el
            }
            return this.getScrollEl(el.parentNode)
        }
    },
    beforeDestroy() {
        $dap.event.off(
            document.body,
            `mousemove.pullRefresh_${this._uid} mouseup.pullRefresh_${this._uid}`
        )
    }
}
</script>

<style lang="less" scoped>
@import '../../css/mvi-basic.less';

.mvi-pull-refresh {
    display: block;
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;

    .mvi-pull-refresh-wrapper {
        display: block;
        position: relative;
        width: 100%;
        overflow-x: hidden;
        overflow-y: auto;

        .mvi-pull-refresh-el {
            display: flex;
            display: -webkit-flex;
            justify-content: center;
            align-items: center;
            color: @font-color-sub;
            width: 100%;
            padding: @mp-lg 0;

            .mvi-pull-refresh-text {
                margin-left: @mp-xs;
            }
        }
    }
}
</style>
