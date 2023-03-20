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
              <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left: 10px" @click="handleFilter">查询</el-button>
            </el-form-item>
          </el-col>
          <el-col>
            <el-collapse>
              <el-collapse-item>
                <template slot="title" class="collapse-title">高级搜索</template>
                <div>
                  <el-form-item label="采样时间：" :label-width="labelWidth">
                    <el-col :span="11">
                      <el-date-picker type="date" placeholder="起始日期" v-model="listQuery.timeStart" value-format="yyyy/MM/dd" style="width: 100%;"></el-date-picker>
                    </el-col>
                    <el-col :span="2" align="center">-</el-col>
                    <el-col :span="11">
                      <el-date-picker type="date" placeholder="截止日期" v-model="listQuery.timeEnd" value-format="yyyy/MM/dd" style="width: 100%;"></el-date-picker>
                    </el-col>
                  </el-form-item>
                  <el-form-item label="采样地点：" :label-width="labelWidth">
                    <el-col :span="5">
                      <el-input placeholder="NW经度" v-model="listQuery.NWlo"></el-input>
                    </el-col>
                    <el-col :span="1" align="center">,</el-col>
                    <el-col :span="5">
                      <el-input placeholder="NW纬度" v-model="listQuery.NWla"></el-input>
                    </el-col>
                    <el-col :span="2" align="center">-</el-col>
                    <el-col :span="5">
                      <el-input placeholder="SE经度" v-model="listQuery.SElo"></el-input>
                    </el-col>
                    <el-col :span="1" align="center">,</el-col>
                    <el-col :span="5">
                      <el-input placeholder="SE纬度" v-model="listQuery.SEla"></el-input>
                    </el-col>
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!--表格模块-->
    <el-table
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
      <el-table-column label="ID" prop="idsamples" sortable="custom" align="center" width="80" />
      <el-table-column label="样品名称" prop="name" />
      <el-table-column label="样品种类" prop="category" />
      <el-table-column label="采样时间" prop="samplingtime">
        <template slot-scope="{ row: { samplingtime }}">
          <span>{{ samplingtime | timeFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采样地点" prop="samplinglocation" />
      <el-table-column label="样品状态" prop="state" />
      <el-table-column label="备注" prop="comment">
        <template slot-scope="{ row: { comment }}">
          <span>{{ comment | valueFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
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
      categoryList: [],
      list: [],
      defaultSort: {}
    }
  },
  created() {
    this.parseQuery()
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
      console.log('handleFilter', this.listQuery)
      this.listQuery.page = 1
      this.refresh()
    },
    handleUpdate(row) {
      console.log('handleUpdate', row)
      console.log(`/samples/updatesample/${row.idsamples}`)
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
    }
  }
}

</script>

<style lang="scss" scoped>
</style>
