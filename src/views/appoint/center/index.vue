<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getTableDataApi } from "@/api/appoint"
import { createAppointOrder } from "@/api/table/order"
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
  intro: "",
  times: []
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
    const api = createAppointOrder
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
  // ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
  //   confirmButtonText: "确定",
  //   cancelButtonText: "取消",
  //   type: "warning"
  // }).then(() => {
  //   deleteTableDataApi(row.id as string).then(() => {
  //     ElMessage.success("删除成功")
  //     getTableData()
  //   })
  // })
}
//#endregion

//#region 改
const handleUpdate = (row: GetTableData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
  console.log(formData.value)
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
    username: searchData.username || undefined
    // phone: searchData.phone || undefined,
    // type: searchData.type || undefined
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
  children?: Array<ListItem>
}
const searchOptions = ref<Array<ListItem>>([])
const timer = ref()
const classrooms = ref<Array<ListItem>>([{ value: "", label: "" }])
const searchReq = async (query: string) => {
  const res = (await searchTableDataApi(query)) as any
  classrooms.value = res.data.map((classroom: any) => ({
    value: classroom.id,
    label: classroom.location,
    children: classroom.rooms?.map((room: any, index: number) => ({
      value: room.id,
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

const treeRef = ref()
const onRoomSelected = (value: any) => {
  console.log(value)
}

// remoteMethod("")
//#endregion

const formatSex = (sex: string | undefined) => {
  if (sex == "MAN") return "男"
  else if (sex == "WOMAN") return "女"
  else return "不愿透露"
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

//#region 预约

//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="老师名字">
          <el-input v-model="searchData.username" placeholder="请输入（可模糊搜索）" />
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
          <!--          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增用户</el-button>-->
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
        <el-space wrap>
          <el-card v-for="i in tableData" :key="i.id" class="box-card" style="width: 310px">
            <template #header>
              <el-space wrap>
                <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
                <el-space direction="vertical" alignment="flex-start">
                  <el-text class="mx-1" type="info">{{ i.nickname }}</el-text>
                  <el-text class="mx-1" type="info" size="small"
                    ><el-icon><Location /></el-icon>{{ i.officeNames?.join("") }}</el-text
                  >
                </el-space>
              </el-space>
            </template>
            <div class="text item">
              {{ i.intro || "这个人很懒，什么也没留下~" }}
            </div>
            <template #footer="">
              <el-button plain @click="handleUpdate(i)">看TA</el-button>
            </template>
          </el-card>
        </el-space>
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
    <el-dialog v-model="dialogVisible" title="向TA预约" @closed="resetForm" width="30%">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="150px" label-position="left">
        <el-form-item prop="nickname" label="教师名称">
          <el-tag type="info">{{ formData.nickname }}</el-tag>
        </el-form-item>
        <el-form-item prop="sex" label="性别">
          <el-tag type="info">{{ formatSex(formData.sex) }}</el-tag>
        </el-form-item>
        <el-form-item prop="officeIds" label="办公地点">
          <el-tag type="info">{{ formData.officeNames?.join("") }}</el-tag>
        </el-form-item>
        <el-form-item prop="phone" label="简介">
          <el-text class="mx-1">{{ formData.intro || "这个人很懒，什么也没留下~" }}</el-text>
        </el-form-item>
        <el-form-item prop="times" label="选择时间">
          <el-date-picker
            v-model="formData.times"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
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

.card-header {
  display: flex;
  align-items: center;
}
</style>
