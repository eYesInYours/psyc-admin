<script lang="ts" setup>
import { reactive, ref, watch, computed } from "vue"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table/classroom"
import { type CreateOrUpdateTableRequestData, type GetTableData } from "@/api/table/types/table"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight, Plus } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "ClassRoomManage"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  id: undefined,
  location: "",
  rooms: [
    {
      capacity: 1,
      doorPlate: ""
    }
  ]
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))
// 生成computed
const roomsSelector: any = computed(() =>
  formData.value.rooms?.map((item: any) => ({
    value: item,
    label: item
  }))
)
const selectRooms = ref([])
const validateRoom = (rule: any, value: any, callback: any) => {
  value.forEach((item: any) => {
    if (!item.doorPlate) return callback(new Error("请输入教室门牌号"))
  })
  callback()
}
const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  location: [{ required: true, trigger: "blur", message: "请输入教学楼" }],
  // capacity: [{ required: true, trigger: "blur", message: "请输入教室容量" }],
  rooms: [{ required: true, trigger: "blur", validator: validateRoom }]
}

/* 新增教室 */
const addNewRoom = () => {
  formData.value.rooms?.push({
    doorPlate: "",
    capacity: 1
  })
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
const delRoom = (index: number) => {
  console.log(index)
  formData.value.rooms?.splice(index, 1)
}

const handleDelete = (row: GetTableData) => {
  ElMessageBox.confirm(`正在删除教学楼：${row.location}，确认删除？`, "提示", {
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
  if (!formData.value.rooms?.length) {
    formData.value.rooms?.push({
      doorPlate: "",
      capacity: 1
    })
  }
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
  location: ""
})
const getTableData = () => {
  loading.value = true
  getTableDataApi({
    pageNum: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    location: searchData.location || undefined
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

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="location" label="教学楼">
          <el-input v-model="searchData.location" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增教室</el-button>
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
          <el-table-column prop="id" label="教室ID" align="center" />
          <el-table-column prop="location" label="位置" align="center" />
          <el-table-column prop="rooms" label="教室" align="center">
            <template #default="scope">
              <!--              <el-tag type="primary" >{{ item }}</el-tag>-->
              <el-popover
                v-for="(item, index) in scope.row.rooms"
                :key="index"
                placement="top-start"
                title="容纳人数"
                :width="200"
                trigger="hover"
                :content="String(item.capacity)"
              >
                <template #reference>
                  <el-button class="m-2">
                    <el-text class="mx-1" type="info">教室门牌号：{{ item.doorPlate }}</el-text>
                  </el-button>
                </template>
              </el-popover>
            </template>
          </el-table-column>
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
      :title="formData.id === undefined ? '新增教室' : '修改教室'"
      @closed="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="id" label="教学楼ID">
          <el-input v-model="formData.id" disabled placeholder="自动生成，不用输入" />
        </el-form-item>
        <el-form-item prop="location" label="教学楼">
          <el-input v-model="formData.location" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="rooms" label="教室">
          <el-card style="min-width: 70%; margin-bottom: 10px" v-for="(item, index) in formData.rooms" :key="index">
            <template #header>
              <div class="card-header">
                <el-text class="mx-1" type="info">教室门牌：</el-text>
                <el-input v-model="item.doorPlate" style="width: 120px" size="small" placeholder="请输入门牌号" />
              </div>
            </template>
            <template #default>
              <el-text class="mx-1" type="info">容纳人数：</el-text>
              <el-input-number size="small" v-model="item.capacity" :min="1" :max="200" />
            </template>
            <template #footer>
              <el-button type="danger" :icon="Delete" circle @click="delRoom(index)" />
            </template>
          </el-card>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" round :icon="Plus" @click="addNewRoom">添加教室</el-button>
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
