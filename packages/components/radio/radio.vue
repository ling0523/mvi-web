<template>
    <label :disabled="disabled" class="mvi-radio" v-on="listeners">
        <span :disabled="disabled" v-if="label && labelPlacement=='left'" class="mvi-radio-label" :data-placement="labelPlacement" v-text="label" :style="labelStyle"></span>
        <input @change="change" :value="value" :disabled="disabled" :checked="check" type="radio" :name="name" />
        <span :disabled="disabled" :class="['mvi-radio-item',check?'mvi-radio-item-check':'']" :style="radioStyle">
            <m-icon :disabled="disabled" :color="iconColor" :size="iconSize" :type="iconType" :class="['mvi-radio-icon',check?'mvi-radio-icon-check':'']" />
        </span>
        <span :disabled="disabled" v-if="label && labelPlacement == 'right'" class="mvi-radio-label" :data-placement="labelPlacement" v-text="label" :style="labelStyle"></span>
    </label>
</template>

<script>
import $dap from 'dap-util'
import mIcon from '../icon/icon'
export default {
    name: 'm-radio',
    model: {
        prop: 'checked',
        event: 'model-change'
    },
    props: {
        //单选框的值
        value: {
            type: [String, Number, Object, Array],
            default: ''
        },
        //是否选中
        checked: {
            type: [Object, Boolean, String, Number, Array],
            default: false
        },
        //是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        //label文字
        label: {
            type: String,
            default: null
        },
        //文字位置
        labelPlacement: {
            type: String,
            default: 'right',
            validator(value) {
                return ['left', 'right'].includes(value)
            }
        },
        //文字颜色
        labelColor: {
            type: String,
            default: null
        },
        //文字尺寸
        labelSize: {
            type: String,
            default: null
        },
        //填充颜色
        fillColor: {
            type: String,
            default: null
        },
        //图标
        icon: {
            type: [String, Object],
            default: 'success'
        },
        //是否圆形
        round: {
            type: Boolean,
            default: true
        },
        //原生name
        name: {
            type: String,
            default: null
        }
    },
    computed: {
        labelStyle() {
            let style = {}
            if (!this.disabled && this.labelColor) {
                style.color = this.labelColor
            }
            if (this.labelSize) {
                style.fontSize = this.labelSize
            }
            return style
        },
        iconColor() {
            if (this.disabled || !this.check) {
                return null
            }
            let color = null
            if ($dap.common.isObject(this.icon)) {
                if (typeof this.icon.color == 'string') {
                    color = this.icon.color
                }
            }
            return color
        },
        iconSize() {
            let size = null
            if ($dap.common.isObject(this.icon)) {
                if (typeof this.icon.size == 'string') {
                    size = this.icon.size
                }
            }
            return size
        },
        iconType() {
            let type = 'success'
            if ($dap.common.isObject(this.icon)) {
                if (typeof this.icon.type == 'string') {
                    type = this.icon.type
                }
            } else if (typeof this.icon == 'string') {
                type = this.icon
            }
            return type
        },
        radioStyle() {
            let style = {}
            if (!this.disabled && this.check && this.fillColor) {
                style.backgroundColor = this.fillColor
                style.borderColor = this.fillColor
            }
            if (this.round) {
                style.borderRadius = '50%'
            }
            return style
        },
        check() {
            //checked为boolean
            if (typeof this.checked == 'boolean') {
                return this.checked
            } else {
                return $dap.common.equal(this.checked, this.value)
            }
        },
        listeners() {
            return Object.assign({}, this.$listeners)
        }
    },
    components: {
        mIcon
    },
    methods: {
        change(event) {
            if (typeof this.checked == 'boolean') {
                this.$emit('update:checked', event.target.checked)
                this.$emit('model-change', event.target.checked)
            } else {
                //勾选
                if (event.target.checked) {
                    this.$emit('update:checked', this.value)
                    this.$emit('model-change', this.value)
                }
            }
        }
    }
}
</script>

<style scoped lang="less">
@import '../../css/mvi-basic.less';

.mvi-radio {
    display: inline-flex;
    margin: 0;
    padding: 0;
    vertical-align: middle;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    cursor: pointer;
}

.mvi-radio > input[type='radio'] {
    width: 0;
    height: 0;
    opacity: 0;
    border: none;
    display: none;
}

.mvi-radio-item {
    display: inline-flex;
    display: -webkit-inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin: 0;
    padding: @mp-xs / 2;
    border: 1px solid @border-color;
    background-color: #fff;
}

.mvi-radio-item.mvi-radio-item-check {
    background-color: @info-normal;
    border-color: @info-normal;
}

.mvi-radio-item[disabled],
.mvi-radio-item.mvi-radio-item-check[disabled] {
    background-color: @bg-color-dark;
    border-color: @border-color;
}

.mvi-radio-icon {
    font-size: @font-size-default;
    margin: 0;
    padding: 0;
    line-height: 1;
    color: transparent;
    transition: color 100ms;
}

.mvi-radio-icon.mvi-radio-icon-check {
    color: #fff;
}

.mvi-radio-icon.mvi-radio-icon-check[disabled] {
    color: @font-color-mute;
}

.mvi-radio-label {
    vertical-align: middle;
    font-size: @font-size-default;
    color: @font-color-default;
    user-select: none;

    &[data-placement='left'] {
        margin-right: @mp-xs;
    }

    &[data-placement='right'] {
        margin-left: @mp-xs;
    }

    &[disabled] {
        color: @font-color-mute;
    }
}
</style>
