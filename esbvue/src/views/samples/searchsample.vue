<template>
  <div class="app-container">
    <!--查询模块-->
    <div class="filter-container">
      <el-form>
        <el-row>
          <el-col :span="8">
            <el-form-item prop="name" label="样品名称：" :label-width="labelWidth">
              <el-input v-model="listQuery.name" placeholder="样品名称" style="width: 200px" class="filter-item" clearable @keyup.enter.native="handleFilter" @clear="handleFilter" @blur="handleFilter" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="category" label="样品种类：" :label-width="labelWidth">
              <el-select v-model="listQuery.category" placeholder="分类" clearable class="filter-item" @change="handleFilter">
                <el-option
                  v-for="item in categoryList"
                  :key="item.value"
                  :label="item.label + '(' + item.num + ')'"
                  :value="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-button class="filter-item" type="primary" :loading="Bloading" icon="el-icon-search" style="margin-left: 10px" @click="handleFilter">查询</el-button>
              <el-button class="filter-item" type="primary" :loading="Bloading" icon="el-icon-star-on" style="margin-left: 10px" @click="handleSelStar">收藏</el-button>
              <el-button class="filter-item" type="primary" :loading="Bloading" icon="el-icon-download" style="margin-left: 10px" @click="handleExport">导出</el-button>
            </el-form-item>
          </el-col>
          <el-col>
            <el-collapse>
              <el-collapse-item>
                <template slot="title" class="collapse-title">高级查询</template>
                <div>
                  <el-row type="flex">
                    <el-col :span="12">
                      <el-form-item label="采样时间：" :label-width="labelWidth">
                        <el-col :span="6">
                          <el-form-item prop="timeStart">
                            <el-date-picker v-model="listQuery.timeStart" type="date" placeholder="起始日期" value-format="yyyy/MM/dd" style="width: 100%;" />
                          </el-form-item>
                        </el-col>
                        <el-col :span="1" align="center">-</el-col>
                        <el-col :span="6">
                          <el-form-item prop="timeEnd">
                            <el-date-picker v-model="listQuery.timeEnd" type="date" placeholder="截止日期" value-format="yyyy/MM/dd" style="width: 100%;" />
                          </el-form-item>
                        </el-col>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="采样地点：" :label-width="labelWidth">
                        <el-col :span="4">
                          <el-input v-model="listQuery.NWlo" placeholder="NW经度" />
                        </el-col>
                        <el-col :span="4">
                          <el-input v-model="listQuery.NWla" placeholder="NW纬度" />
                        </el-col>
                        <el-col :span="1" align="center">-</el-col>
                        <el-col :span="4">
                          <el-input v-model="listQuery.SElo" placeholder="SE经度" />
                        </el-col>
                        <el-col :span="4">
                          <el-input v-model="listQuery.SEla" placeholder="SE纬度" />
                        </el-col>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!--表格模块-->
    <el-table
      ref="sampleTable"
      :key="tablekey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :default-sort="defaultSort"
      @sort-change="sortChange"
    >
      <el-table-column type="selection" />
      <el-table-column label="ID" prop="idsamples" sortable="custom" align="center" width="80" />
      <el-table-column label="样品名称" prop="name" />
      <el-table-column label="样品种类" prop="category" />
      <el-table-column label="采样时间" prop="samplingtime">
        <template slot-scope="{ row: { samplingtime }}">
          <span>{{ samplingtime | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采样坐标" prop="samplinglna" />
      <el-table-column label="采样地点" prop="samplinglocation" />
      <el-table-column label="湿重（g）" prop="wetweight" />
      <el-table-column label="干重（g）" prop="dryweight" />
      <el-table-column label="样品状态" prop="state" />
      <el-table-column label="样品存储位置" prop="locationofstorage" />
      <el-table-column label="备注" prop="comment">
        <template slot-scope="{ row: { comment }}">
          <span>{{ comment | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="isAdmin" label="操作">
        <template slot-scope="{ row }">
          <el-button type="text" icon="el-icon-star-off" style="color:#ffd700" @click="handleStar(row)" />
          <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-button type="text" icon="el-icon-delete" style="color:#f56c6c" @click="handleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>

    <!--分页模块-->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.pageSize"
      @pagination="refresh"
    />
  </div>
</template>

<script>
import Pagination from '../../components/Pagination'
import { getCategory, listSample, deleteSample } from '../../api/sample'
import { parseTime } from '../../utils'
import store from '../.././store'

export default {
  components: { Pagination },
  filters: {
    valueFilter(value) {
      return value || '无'
    },
    timeFilter(time) {
      return time ? parseTime(time, '{y}-{m}-{d}') : '无'
    }
  },
  data() {
    return {
      tablekey: 0,
      total: 0,
      listQuery: {},
      listLoading: true,
      Bloading: false,
      categoryList: [],
      list: [],
      defaultSort: {},
      labelWidth: '120px',
      isAdmin: false
    }
  },
  created() {
    this.parseQuery()
    this.checkRole()
  },
  mounted() {
    this.getList()
    this.getCategoryList()
  },
  beforeRouteUpdate(to, from, next) {
    if (to.path === from.path) {
      const newQuery = Object.assign({}, to.query)
      const oldQuery = Object.assign({}, from.query)
      if (JSON.stringify(newQuery) !== JSON.stringify(oldQuery)) {
        this.getList()
      }
    }
    next()
  },
  methods: {
    async checkRole() {
      const { role } = await store.dispatch('user/getInfo')
      if (role === 'admin') {
        this.isAdmin = true
      }
    },
    parseQuery() {
      const query = Object.assign({}, this.$route.query)
      let sort = '+idsamples'
      const listQuery = {
        page: 1,
        pageSize: 20,
        sort
      }
      if (query) {
        query.page && (query.page = +query.page)
        query.pageSize && (query.pageSize = +query.pageSize)
        query.sort && (sort = query.sort)
      }
      const sortSymbol = sort[0]
      const sortColumn = sort.slice(1, sort.length)
      console.log(sortSymbol, sortColumn)
      this.defaultSort = {
        prop: sortColumn,
        order: sortSymbol === '+' ? 'ascending' : 'descending'
      }
      this.listQuery = { ...listQuery, ...query }
    },
    sortChange(data) {
      console.log('sortChange', data)
      const { prop, order } = data
      this.sortBy(prop, order)
    },
    sortBy(prop, order) {
      if (order === 'ascending') {
        this.listQuery.sort = `+${prop}`
      } else {
        this.listQuery.sort = `-${prop}`
      }
      this.handleFilter()
    },
    wrapperKeyword(k, v) {
      function highlight(value) {
        return `<span style="color: #1890ff">${value}</span>`
      }

      if (!this.listQuery[k]) {
        return v
      } else {
        return v.replace(new RegExp(this.listQuery[k], 'ig'), v => highlight(v))
      }
    },
    getList() {
      this.listLoading = true
      listSample(this.listQuery).then(response => {
        const { list, count } = response.data
        this.list = list
        this.total = count
        this.listLoading = false
      })
    },
    getCategoryList() {
      getCategory().then(response => {
        this.categoryList = response.data
      })
    },
    refresh() {
      this.$router.push({
        path: '/samples/searchsample',
        query: this.listQuery
      })
    },
    handleFilter() {
      this.Bloading = true
      console.log('handleFilter', this.listQuery)
      this.listQuery.page = 1
      this.refresh()
      this.Bloading = false
    },
    handleUpdate(row) {
      console.log('handleUpdate', row)
      this.$router.push(`/samples/updatesample/${row.idsamples}`)
    },
    handleDelete(row) {
      this.$confirm('此操作将永久删除此样品信息，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSample(row.idsamples).then(response => {
          this.$notify({
            title: '成功',
            message: response.msg || '删除成功',
            type: 'success',
            duration: 2000
          })
          this.handleFilter()
        })
      })
    },
    handleSelStar() {
      this.Bloading = true
      const sel = this.$refs.sampleTable.selection
      sel.forEach(row => {
        console.log(row.idsamples)
      })
      this.Bloading = false
    },
    handleStar(row) {
      console.log(row)
    },
    handleExport() {
      this.Bloading = true
      console.log('export...')
      const sel = this.$refs.sampleTable.selection
      console.log(sel)
      if (sel.length === 0) {
        this.$message({
          message: '至少选择一项样品信息',
          type: 'warning'
        })
        this.Bloading = false
        return false
      }
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '样品名称', '样品种类', '采样时间', '采样地点', '样品状态', '备注']
        const filterVal = ['idsamples', 'name', 'category', 'samplingtime', 'samplinglocation', 'state', 'comment']
        const list = sel
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'sample_export_' + parseTime(new Date())
        })
        this.Bloading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}

</script>

<style lang="scss" scoped>
</style>
