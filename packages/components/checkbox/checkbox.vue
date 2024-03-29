<template>
    <label v-on="listeners" class="mvi-checkbox" :disabled="disabled">
        <span v-if="labelPlacement=='left' && label" :disabled="disabled" class="mvi-checkbox-label" :data-placement="labelPlacement" v-text="label" :style="labelStyle"></span>
        <input @change="change" :value="value" :disabled="disabled" :checked="check" type="checkbox" :name="name" />
        <span :disabled="disabled" :class="['mvi-checkbox-item',check?'mvi-checkbox-item-check':'']" :style="checkboxStyle">
            <m-icon :disabled="disabled" :color="iconColor" :size="iconSize" :type="iconType" :class="['mvi-checkbox-icon',check?'mvi-checkbox-icon-check':'']" />
        </span>
        <span v-if="labelPlacement=='right' && label" :disabled="disabled" class="mvi-checkbox-label" :data-placement="labelPlacement" v-text="label" :style="labelStyle"></span>
    </label>
</template>

<script>
import $dap from 'dap-util'
import mIcon from '../icon/icon'
export default {
    name: 'm-checkbox',
    model: {
        prop: 'checked',
        event: 'model-change'
    },
    props: {
        //是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        //是否选中
        checked: {
            type: [Boolean, Array],
            default: false
        },
        //label文字
        label: {
            type: String,
            default: null
        },
        //文字颜色
        labelColor: {
            type: String,
            default: null
        },
        //文字大小
        labelSize: {
            type: String,
            default: null
        },
        //值
        value: {
            type: [String, Number, Object, Array],
            default: ''
        },
        //填充颜色
        fillColor: {
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
        //是否圆形
        round: {
            type: Boolean,
            default: false
        },
        //图标
        icon: {
            type: [String, Object],
            default: 'success'
        },
        //原生name属性
        name: {
            type: String,
            default: null
        }
    },
    computed: {
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
        checkboxStyle() {
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
        check() {
            //checked为boolean
            if (typeof this.checked == 'boolean') {
                return this.checked
            } else if (Array.isArray(this.checked)) {
                //数组中是否已包含此复选框的值
                return this.checked.some(item => {
                    return $dap.common.equal(item, this.value)
                })
            } else {
                return false
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
        //复选框改变
        change(event) {
            if (Array.isArray(this.checked)) {
                let arr = [...this.checked]
                //勾选且不包含
                if (event.target.checked && !this.check) {
                    arr.push(this.value)
                }
                //取消且包含
                else if (this.check) {
                    arr = arr.filter(item => {
                        return !$dap.common.equal(item, this.value)
                    })
                }
                this.$emit('update:checked', arr)
                this.$emit('model-change', arr)
            } else if (typeof this.checked == 'boolean') {
                this.$emit('update:checked', event.target.checked)
                this.$emit('model-change', event.target.checked)
            }
        }
    }
}
</script>

<style scoped lang="less">
@import '../../css/mvi-basic.less';

.mvi-checkbox {
    display: inline-flex;
    margin: 0;
    padding: 0;
    position: relative;
    vertical-align: middle;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
}

.mvi-checkbox > input[type='checkbox'] {
    width: 0;
    height: 0;
    opacity: 0;
    border: none;
    display: none;
}

.mvi-checkbox > .mvi-checkbox-item {
    display: inline-flex;
    display: -webkit-inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin: 0;
    padding: @mp-xs / 2;
    border: 1px solid @border-color;
    border-radius: @radius-default;
    background-color: #fff;
}

.mvi-checkbox > .mvi-checkbox-item.mvi-checkbox-item-check {
    background-color: @info-normal;
    border-color: @info-normal;
}

.mvi-checkbox > .mvi-checkbox-item[disabled],
.mvi-checkbox > .mvi-checkbox-item.mvi-checkbox-item-check[disabled] {
    background-color: @bg-color-dark;
    border-color: @border-color;
}

.mvi-checkbox-icon {
    font-size: @font-size-default;
    margin: 0;
    padding: 0;
    line-height: 1;
    color: transparent;
    transition: color 100ms;
}

.mvi-checkbox-icon.mvi-checkbox-icon-check {
    color: #fff;
}

.mvi-checkbox-icon.mvi-checkbox-icon-check[disabled] {
    color: @font-color-mute;
}

.mvi-checkbox-label {
    vertical-align: middle;
    font-size: @font-size-default;
    color: @font-color-default;
    user-select: none;

    &[data-placement='left'] {
        margin-right: @mp-sm;
    }

    &[data-placement='right'] {
        margin-left: @mp-sm;
    }

    &[disabled] {
        color: @font-color-mute;
    }
}
</style>
