<template>
  <el-collapse v-model="activeNames" accordion>
    <el-collapse-item name="1" align="middle">
      <template slot="title" class="collapse-title">新增单个样品信息</template>
      <div>
        <el-form ref="postForm" :model="postForm" :rules="postrules">
          <div class="detail-container">
            <el-row>
              <el-col :span="12">
                <el-form-item prop="name" label="样品名称：" :label-width="labelWidth">
                  <el-input ref="name" v-model="postForm.name" placeholder="样品名称" name="name" tabindex="1" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="category" label="样品种类：" :label-width="labelWidth">
                  <el-input ref="category" v-model="postForm.category" placeholder="样品种类" name="category" tabindex="2" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="samplingtime" label="采样时间：" :label-width="labelWidth">
                  <el-date-picker ref="samplingtime" v-model="postForm.samplingtime" value-format="yyyy/MM/dd" placeholder="采样时间" style="width: 100%;" name="samplingtime" tabindex="3" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="采样地点：" :label-width="labelWidth" required>
                  <el-col :span="11">
                    <el-form-item prop="longitude">
                      <el-input ref="longitude" v-model="postForm.longitude" placeholder="经度" name="longitude" tabindex="4" />
                    </el-form-item>
                  </el-col>
                  <el-col class="line" :span="2" align="middle">-</el-col>
                  <el-col :span="11">
                    <el-form-item prop="latitude">
                      <el-input ref="latitude" v-model="postForm.latitude" placeholder="纬度" name="latitude" tabindex="5" />
                    </el-form-item>
                  </el-col>
                </el-form-item>
              </el-col>
              <el-col>
                <el-form-item prop="comment" label="备注：" :label-width="labelWidth">
                  <el-input ref="comment" v-model="postForm.comment" type="textarea" :rows="5" name="comment" tabindex="6" />
                </el-form-item>
              </el-col>
              <el-col>
                <el-form-item>
                  <el-button v-if="!isEdit" :loading="loading" type="primary" icon="el-icon-delete" @click="handleClear">清空</el-button>
                  <el-button :loading="loading" type="primary" icon="el-icon-document-add" @click="handleInsert">{{ isEdit ? '编辑样品信息' : '添加新样品信息' }}</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
    </el-collapse-item>
    <el-collapse-item name="2" align="middle" :disabled="isEdit">
      <template slot="title" class="collapse-title">新增多个样品信息</template>
      <div>
        <el-col label="批量上传" :label-width="labelWidth">
          <el-upload
            class="upload-demo"
            drag
            :action="action"
            :multiple="false"
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只能上传txt/csv/excel文件，且不超过500kb</div>
          </el-upload>
        </el-col>
        <el-col>
          <el-button :loading="loading" type="primary" icon="el-icon-upload2" @click="handleUpload">上传</el-button>
        </el-col>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
import { createSample, getSample, updateSample } from '../../../api/sample'

const fields = {
  name: '样品名称',
  category: '样品种类',
  samplingtime: '采样时间',
  longitude: '经度',
  latitude: '纬度'
}

export default {
  props: {
    isEdit: Boolean
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value && value.length === 0) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else {
        callback()
      }
    }
    const validateLocation = (rule, value, callback) => {
      const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,9})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      if (!value && value.length === 0) {
        callback(new Error(fields[rule.field] + '必须填写'))
      } else if (!reg.test(value)) {
        return callback(new Error(fields[rule.field] + '必须为数字（最多9位小数）'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      postForm: {
        name: '',
        category: '',
        samplingtime: '',
        longitude: '',
        latitude: '',
        comment: ''
      },
      action: `${process.env.VUE_APP_BASE_API}/sample/upload`,
      labelWidth: '120px',
      activeNames: ['1'],
      postrules: {
        name: [{ required: true, trigger: 'blur', validator: validateRequire }],
        category: [{ required: true, trigger: 'blur', validator: validateRequire }],
        samplingtime: [{ required: true, trigger: 'blur', validator: validateRequire }],
        longitude: [{ trigger: 'blur', validator: validateLocation }],
        latitude: [{ trigger: 'blur', validator: validateLocation }]
      }
    }
  },
  mounted() {
    if (this.postForm.name === '') {
      this.$refs.name.focus()
    } else if (this.postForm.category === '') {
      this.$refs.category.focus()
    } else if (this.postForm.samplingtime === '') {
      this.$refs.samplingtime.focus()
    }
  },
  created() {
    if (this.isEdit) {
      const sampleID = this.$route.params.idsamples
      this.getSampleData(sampleID)
    }
  },
  methods: {
    getSampleData(sampleID) {
      getSample(sampleID).then(response => {
        this.setData(response.data)
      })
    },
    setData(data) {
      const { name, category, samplingtime, longitude, latitude, comment } = data
      this.postForm = { ...this.postForm, name, category, samplingtime, longitude, latitude, comment }
    },
    handleClear() {
      this.$refs.postForm.resetFields()
    },
    handleInsert() {
      const onSuccess = (response) => {
        const { msg } = response
        this.$notify({
          title: '操作成功',
          message: msg,
          type: 'success',
          duration: 2000
        })
        this.loading = false
      }

      console.log(this.postForm)
      if (!this.loading) {
        this.loading = true
        this.$refs.postForm.validate((valid, fields) => {
          console.log(valid, fields)
          if (valid) {
            const sample = Object.assign({}, this.postForm)
            sample.idsamples = this.$route.params.idsamples
            if (!this.isEdit) {
              createSample(sample).then(response => {
                onSuccess(response)
                this.$refs.postForm.resetFields()
              }).catch(() => {
                this.loading = false
              })
            } else {
              updateSample(sample).then(response => {
                onSuccess(response)
              }).catch(() => {
                this.loading = false
              })
            }
          } else {
            const message = fields[Object.keys(fields)[0]][0].message
            this.$message({ message, type: 'error' })
            this.loading = false
          }
        })
      }
    },
    handleUpload() {
      console.log('upload...')
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  padding: 40px 50px 20px;
}
.collapse-title {
  // flex: 1 0 90%; //位于左侧
  flex: 0 1 54%;// 位于中间
  order: 1;
}
</style>
