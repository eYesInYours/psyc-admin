<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { searchTableDataApi } from "@/api/table/classroom"
import { type CreateOrUpdateTableRequestData, type GetTableData } from "@/api/table/types/table"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "UserManage"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  id: undefined,
  username: "",
  password: "",
  type: undefined,
  phone: "",
  intro: ""
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  username: [{ required: true, trigger: "blur", message: "请输入账号" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createTableDataApi : updateTableDataApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getTableData()
      })
      .finally(() => {
        loading.value = false
      })
  })
}
const resetForm = () => {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
//#endregion

//#region 删
const handleDelete = (row: GetTableData) => {
  ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row.id as string).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}
//#endregion

//#region 改
const handleUpdate = (row: GetTableData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}
//#endregion

//#region 查
const tableData = ref<GetTableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const userTypes = [
  {
    label: "学生",
    value: "STUDENT"
  },
  {
    label: "教师",
    value: "TEACHER"
  },
  {
    label: "管理员",
    value: "ADMIN"
  }
]
const searchData = reactive({
  username: "",
  phone: "",
  type: ""
})
const getTableData = () => {
  loading.value = true
  getTableDataApi({
    pageNum: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    username: searchData.username || undefined,
    phone: searchData.phone || undefined,
    type: searchData.type || undefined
  })
    .then(({ data }) => {
      paginationData.total = data.total
      tableData.value = data.list
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
//#endregion

//#region search
interface ListItem {
  value: string
  label: string
}
const searchOptions = ref<Array<ListItem>>([])
const timer = ref()
const classrooms = ref<any>([])
const searchReq = async (query: string) => {
  const res = (await searchTableDataApi(query)) as any
  classrooms.value = res.data.map((classroom: any) => ({
    value: classroom.id,
    label: classroom.location,
    children: classroom.rooms?.map((room: any, index: number) => ({
      value: room.doorPlate,
      label: room.doorPlate
    }))
  }))
}

const remoteMethod = async (query: string) => {
  if (timer.value) clearTimeout(timer.value)
  timer.value = setTimeout(() => {
    searchReq(query)
  }, 300)
}

const onRoomSelected = (e: any) => {
  console.log(e)
}

remoteMethod("")
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="searchData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="searchData.phone" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="用户类型">
          <el-select v-model="searchData.type" placeholder="请选择" style="width: 240px">
            <el-option v-for="item in userTypes" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增用户</el-button>
          <!-- <el-button type="danger" :icon="Delete">批量删除</el-button> -->
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="用户ID" align="center" />
          <el-table-column prop="username" label="账号" align="center" />
          <el-table-column prop="nickname" label="昵称" align="center" />
          <el-table-column prop="type" label="角色" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.type === 'ADMIN'" type="danger" effect="plain">管理员</el-tag>
              <el-tag v-else-if="scope.row.type === 'TEACHER'" type="warning" effect="plain">教师</el-tag>
              <el-tag v-else-if="scope.row.type === 'STUDENT'" type="info" effect="plain">学生</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="teacherOffice" label="办公地点" align="center">
            <template #default="scope">
              <el-tag type="info" effect="plain">{{ scope.row.teacherOffice || "无" }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" align="center" />
          <el-table-column prop="createTime" label="创建时间" align="center" />
          <el-table-column prop="updateTime" label="更新时间" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '新增用户' : '修改用户'"
      @closed="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="id" label="用户ID">
          <el-input v-model="formData.id" disabled placeholder="自动生成，不用输入" />
        </el-form-item>
        <el-form-item prop="username" label="账号">
          <el-input v-model="formData.username" :disabled="!!formData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item v-if="!formData.id" prop="password" label="密码">
          <el-input maxlength="14" show-word-limit type="password" v-model="formData.password" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="nickname" label="昵称">
          <el-input v-model="formData.nickname" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="角色">
          <template #default>
            <el-select :disabled="!!formData.id" v-model="formData.type" placeholder="请选择" style="width: 240px">
              <el-option v-for="item in userTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </template>
        </el-form-item>
        <el-form-item prop="teacherOffice" label="办公地点">
          <!-- <el-select
            :disabled="formData.type != 'TEACHER'"
            v-model="formData.teacherOffice"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键字搜索（教师选）"
            remote-show-suffix
            :remote-method="remoteMethod"
            :loading="loading"
            style="width: 240px"
          >
            <el-option v-for="item in classrooms" :key="item.id" :label="item.location" :value="item.id" />
          </el-select> -->
          <el-tree-select
            filterable
            v-model="formData.teacherOffice"
            :data="classrooms"
            :render-after-expand="false"
            style="width: 240px"
            @node-click="onRoomSelected"
          />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="phone" label="简介">
          <el-input
            :autosize="{ minRows: 3, maxRows: 5 }"
            type="textarea"
            v-model="formData.intro"
            placeholder="请输入"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate" :loading="loading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
