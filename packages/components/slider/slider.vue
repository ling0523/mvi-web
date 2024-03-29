<template>
    <div :disabled="disabled" :class="sliderClass" v-on="listeners" :style="sliderStyle" @click="dragTo" ref="slider">
        <div ref="bar" class="mvi-slider-bar" :style="sliderBarStyle">
        </div>
        <div class="mvi-slider-button" ref="btn">
            <slot name="button" v-if="$slots.button"></slot>
            <div v-else :class="['mvi-slider-button-el',buttonClass || '']" :style="buttonElStyle"></div>
        </div>
    </div>
</template>

<script>
import $dap from 'dap-util'
import Drag from '../drag/drag'
export default {
    name: 'm-slider',
    data() {
        return {
            drag: null,
            isdrag: false
        }
    },
    model: {
        prop: 'value',
        event: 'model-change'
    },
    props: {
        //当前值
        value: {
            type: Number,
            default: 0
        },
        //最小值
        min: {
            type: Number,
            default: 0
        },
        //最大值
        max: {
            type: Number,
            default: 100
        },
        //进度粗细
        barHeight: {
            type: String,
            default: null
        },
        //激活的进度颜色
        activeColor: {
            type: String,
            default: null
        },
        //进度条默认颜色
        barColor: {
            type: String,
            default: null
        },
        //是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        //是否垂直
        vertical: {
            type: Boolean,
            default: false
        },
        //滑动条是否显示圆形的圆角弧度
        round: {
            type: Boolean,
            default: false
        },
        //滑动条是否不显示圆角弧度
        square: {
            type: Boolean,
            default: false
        },
        //拖拽按钮额外样式类
        buttonClass: {
            type: String,
            default: null
        }
    },
    computed: {
        listeners() {
            return Object.assign({}, this.$listeners)
        },
        sliderStyle() {
            let style = {}
            if (this.barHeight) {
                if (this.vertical) {
                    style.width = this.barHeight
                } else {
                    style.height = this.barHeight
                }
            }
            if (this.barColor) {
                style.backgroundColor = this.barColor
            }
            return style
        },
        sliderBarStyle() {
            let style = {}
            if (this.activeColor) {
                style.backgroundColor = this.activeColor
            }
            let percent = $dap.number.divide(
                $dap.number.subtract(this.value, this.min),
                $dap.number.subtract(this.max, this.min)
            )
            if (this.vertical) {
                style.height = `calc(${percent} * 100%)`
            } else {
                style.width = `calc(${percent} * 100%)`
            }
            return style
        },
        buttonElStyle() {
            let style = {}
            if (this.barHeight) {
                style.width = `calc(${this.barHeight} * 2)`
                style.height = `calc(${this.barHeight} * 2)`
            }
            return style
        },
        sliderClass() {
            let cls = ['mvi-slider']
            if (this.round) {
                cls.push('mvi-slider-radius-round')
            } else if (this.square) {
                cls.push('mvi-slider-radius-square')
            }
            if (this.vertical) {
                cls.push('mvi-slider-vertical')
            }
            return cls
        }
    },
    mounted() {
        this.setBtnOffset()
        this.drag = new Drag(this.$refs.btn, {
            container: this.$refs.slider,
            mode: 'on',
            draggableY: this.vertical && !this.disabled,
            draggableX: !this.vertical && !this.disabled,
            drag: this.onDrag,
            dragged: () => {
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.isdrag = false
                    }, 10)
                })
            }
        })
        this.drag.init()
    },
    watch: {
        disabled(newValue) {
            if (this.drag) {
                if (newValue) {
                    if (this.vertical) {
                        this.drag.draggableY = false
                    } else {
                        this.drag.draggableX = false
                    }
                } else {
                    if (this.vertical) {
                        this.drag.draggableY = true
                    } else {
                        this.drag.draggableX = true
                    }
                }
            }
        },
        vertical(newValue) {
            this.$nextTick(() => {
                this.setBtnOffset()
                this.drag.draggableX = !this.vertical && !this.disabled
                this.drag.draggableY = this.vertical && !this.disabled
            })
        },
        value(newValue) {
            if (!this.isdrag) {
                this.setBtnOffset()
            }
        }
    },
    methods: {
        //拖拽
        onDrag(res) {
            this.isdrag = true
            if (this.vertical) {
                let top = res.placement.top
                let value = $dap.number.add(
                    $dap.number.mutiply(
                        $dap.number.divide(
                            $dap.number.add(
                                top,
                                $dap.number.divide(
                                    this.$refs.btn.offsetHeight,
                                    2
                                )
                            ),
                            this.$el.offsetHeight
                        ),
                        $dap.number.subtract(this.max, this.min)
                    ),
                    this.min
                )
                this.$emit('update:value', value)
                this.$emit('model-change', value)
            } else {
                let left = res.placement.left
                let value = $dap.number.add(
                    $dap.number.mutiply(
                        $dap.number.divide(
                            $dap.number.add(
                                left,
                                $dap.number.divide(
                                    this.$refs.btn.offsetWidth,
                                    2
                                )
                            ),
                            this.$el.offsetWidth
                        ),
                        $dap.number.subtract(this.max - this.min)
                    ),
                    this.min
                )
                this.$emit('update:value', value)
                this.$emit('model-change', value)
            }
        },
        //设置按钮的移动距离
        setBtnOffset() {
            if (this.vertical) {
                this.$refs.btn.style.left = '50%'
                this.$refs.btn.style.top =
                    $dap.number.subtract(
                        $dap.number.mutiply(
                            $dap.number.divide(
                                $dap.number.subtract(this.value, this.min),
                                $dap.number.subtract(this.max - this.min)
                            ),
                            this.$el.offsetHeight
                        ),
                        $dap.number.divide(this.$refs.btn.offsetHeight, 2)
                    ) + 'px'
            } else {
                this.$refs.btn.style.top = '50%'
                this.$refs.btn.style.left =
                    $dap.number.subtract(
                        $dap.number.mutiply(
                            $dap.number.divide(
                                $dap.number.subtract(this.value, this.min),
                                $dap.number.subtract(this.max - this.min)
                            ),
                            this.$el.offsetWidth
                        ),
                        $dap.number.divide(this.$refs.btn.offsetWidth, 2)
                    ) + 'px'
            }
        },
        //跳转到指定位置
        dragTo(event) {
            if (this.disabled) {
                return
            }
            if (this.isdrag) {
                return
            }
            if ($dap.element.isContains(this.$refs.btn, event.target)) {
                return
            }
            if (this.vertical) {
                let top = event.offsetY
                let value = $dap.number.add(
                    $dap.number.mutiply(
                        $dap.number.divide(top, this.$el.offsetHeight),
                        $dap.number.subtract(this.max, this.min)
                    ),
                    this.min
                )
                this.$emit('update:value', value)
                this.$emit('model-change', value)
            } else {
                let left = event.offsetX
                let value = $dap.number.add(
                    $dap.number.mutiply(
                        $dap.number.divide(left, this.$el.offsetWidth),
                        $dap.number.subtract(this.max, this.min)
                    ),
                    this.min
                )
                this.$emit('update:value', value)
                this.$emit('model-change', value)
            }
        }
    }
}
</script>

<style scoped lang="less">
@import '../../css/mvi-basic.less';

.mvi-slider {
    position: relative;
    display: block;
    width: 100%;
    height: 0.1rem;
    background-color: @bg-color-dark;
    touch-action: none;
    border-radius: @radius-default;
    margin: @mp-sm 0;
    user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}

.mvi-slider[disabled] {
    opacity: 0.6;
}

.mvi-slider-vertical {
    height: 100%;
    width: 0.1rem;
    margin: 0 @mp-sm;
}

.mvi-slider.mvi-slider-radius-square {
    border-radius: 0;
}

.mvi-slider.mvi-slider-radius-round {
    border-radius: @radius-round;
}

.mvi-slider-bar {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: @info-normal;
    border-radius: inherit;
    touch-action: none;
}

.mvi-slider-button {
    position: absolute;
    left: 0;
    top: 50%;
    cursor: pointer;
    transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
}

.mvi-slider-vertical .mvi-slider-button {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
}

.mvi-slider-button-el {
    display: block;
    min-width: 0.4rem;
    min-height: 0.4rem;
    background-color: #fff;
    box-shadow: @boxshadow;
    -webkit-box-shadow: @boxshadow;
    border-radius: @radius-circle;
}
</style>
