<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {
  createTableDataApi,
  deleteTableDataApi,
  updateTableDataApi,
  getTableDataApi,
  cancelApi,
  agreeOrRejectApi
} from "@/api/table/order"
import {
  createCommentTableDataApi,
  deleteCommentTableDataApi,
  getCommentTableDataApi,
  getCommentDetailApi
} from "@/api/table/comment"
import { type CreateOrUpdateTableRequestData, type GetTableData } from "@/api/table/types/table"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"

defineOptions({
  // 命名当前组件
  name: "CommentManage"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  id: undefined,
  _id: undefined,
  location: "",
  capacity: 0,
  officeNames: [],
  officeCapacity: "",
  studentDTO: {},
  teacherDTO: {},
  status: "" as any
}
const dialogVisible = ref<boolean>(false)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRef = ref<FormInstance | null>(null)
const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  location: [{ required: true, trigger: "blur", message: "请输入教室地点" }],
  capacity: [{ required: true, trigger: "blur", message: "请输入教室容量" }]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = agreeOrRejectApi
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

const dialogVisible2 = ref<boolean>(false)
const handleOrderUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = updateTableDataApi
    console.log(formData.value)
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible2.value = false
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
  ElMessageBox.confirm(`正在删除订单：${row._id}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row._id as string).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

/*同意预约*/

const cancelOrder = (row: GetTableData) => {
  ElMessageBox.confirm(`正在取消订单：${row._id}，确认取消？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    cancelApi(row._id as string).then(() => {
      ElMessage.success("取消成功")
      getTableData()
    })
  })
}
//#endregion

//#region 改

const handleUpdate = (row: GetTableData) => {
  dialogVisible2.value = true
  formData.value = cloneDeep(row)
}

const handleOrderType = ref("") // AGREE 同意  REJECT 拒绝
const handleOrder = (type: string, row: GetTableData) => {
  dialogVisible.value = true
  handleOrderType.value = type
  formData.value = cloneDeep(row)
  formData.value.status = type
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
  location: "",
  teacherNickname: ""
})
const getTableData = () => {
  loading.value = true
  getTableDataApi({
    pageNum: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    teacherNickname: searchData.teacherNickname || undefined
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

//#region 评价
const commentInfo: any = ref({})
const commentVisible = ref(false)

const commentFormRef = ref<FormInstance | null>(null)
const commentFormRules: FormRules<CreateOrUpdateTableRequestData> = {
  rate: [{ required: true, trigger: "blur", message: "请给本次预约打分" }],
  content: [{ required: true, trigger: "blur", message: "请输入评价内容" }]
}
const handleComment = (row: GetTableData) => {
  commentInfo.value = {
    ...row,
    rate: "",
    content: "",
    createTime: undefined,
    updateTime: undefined
  }
  commentVisible.value = true
}

const createComment = () => {
  commentFormRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    console.log(fields)
    const api = createCommentTableDataApi
    console.log(valid)
    api(commentInfo.value)
      .then(() => {
        ElMessage.success("操作成功")
        commentVisible.value = false
        getTableData()
      })
      .finally(() => {
        loading.value = false
      })
  })
}

/* 查看评论 */
const isEdit = ref(true)
const viewComment = async (row: any) => {
  console.log(row)
  const res = await getCommentDetailApi({
    orderId: row.id
  })
  commentInfo.value = res.data
  console.log(res)
  commentVisible.value = true
  isEdit.value = false
}

const resetCommentInfo = () => {
  commentFormRef.value?.resetFields()
  commentInfo.value = {}
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="location" label="教师昵称">
          <el-input v-model="searchData.teacherNickname" placeholder="请输入" />
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
          <!--          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增教室</el-button>-->
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
          <el-table-column prop="_id" label="订单ID" align="center" />
          <el-table-column prop="teacherDTO" label="位置" align="center">
            <template #default="scope">
              <el-tag>{{ scope.row.teacherDTO?.officeNames.join("") }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.status == 'APPLYING'">申请中</el-tag>
              <el-tag v-else-if="scope.row.status == 'AGREE'" type="success">已接受预约</el-tag>
              <el-tag v-if="scope.row.status == 'REJECT'" type="danger">拒绝预约</el-tag>
              <el-tag v-if="scope.row.status == 'UNDERWAY'" type="info">进行中</el-tag>
              <el-tag v-if="scope.row.status == 'FINISHED'" type="danger">已结束</el-tag>
              <el-tag v-if="scope.row.status == 'RATED'" type="danger">已评价</el-tag>
              <el-tag v-if="scope.row.status == 'CANCELED'" type="danger">已取消</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="teacherDTO.officeCapacity" label="教室容纳人数" align="center" />
          <el-table-column prop="studentDTO.nickname" label="预约者（学生）" align="center">
            <template #default="scope">
              <el-space wrap>
                <el-avatar :size="40" :src="scope.row?.studentDTO?.avatar" />
                <el-text>{{ scope.row?.studentDTO?.nickname }}</el-text>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column prop="teacherDTO.nickname" label="受预约者（教师）" align="center">
            <template #default="scope">
              <el-space wrap>
                <el-avatar :size="40" :src="scope.row?.teacherDTO?.avatar" />
                <el-text>{{ scope.row?.teacherDTO?.nickname }}</el-text>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column prop="times[0]" label="活动开始时间" align="center" />
          <el-table-column prop="times[1]" label="活动结束时间" align="center" />
          <el-table-column prop="createTime" label="订单创建时间" align="center" />
          <el-table-column prop="updateTime" label="订单更新时间" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button v-permission="['ADMIN']" type="primary" text bg size="small" @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button v-permission="['ADMIN']" type="danger" text bg size="small" @click="handleDelete(scope.row)"
                >删除</el-button
              >
              <el-button
                v-permission="['STUDENT']"
                v-if="scope.row.status == 'FINISHED'"
                type="danger"
                text
                bg
                size="small"
                @click="handleComment(scope.row)"
                >评价</el-button
              >
              <el-button
                v-permission="['TEACHER']"
                v-if="scope.row.status == 'APPLYING'"
                type="primary"
                text
                bg
                size="small"
                @click="handleOrder('AGREE', scope.row)"
                >同意</el-button
              >
              <el-button
                v-permission="['TEACHER']"
                v-if="scope.row.status == 'APPLYING'"
                type="danger"
                text
                bg
                size="small"
                @click="handleOrder('REJECT', scope.row)"
                >拒绝</el-button
              >
              <el-button
                v-if="scope.row.status == 'APPLYING'"
                v-permission="['STUDENT']"
                type="danger"
                text
                bg
                size="small"
                @click="cancelOrder(scope.row)"
                >取消</el-button
              >
              <el-button v-if="scope.row.status == 'RATED'" text bg size="small" @click="viewComment(scope.row)"
                >查看评论</el-button
              >
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
    <!-- 订单修改 -->
    <el-dialog v-model="dialogVisible2" title="修改订单" @closed="resetForm" width="30%">
      <el-form ref="formRef" :model="formData" label-width="140px" label-position="left">
        <el-form-item prop="id" label="订单ID">
          <el-input v-model="formData._id" disabled />
        </el-form-item>
        <el-form-item prop="status" label="订单状态">
          <template #default>
            <el-tag v-if="formData.status == 'APPLYING'">申请中</el-tag>
            <el-tag v-else-if="formData.status == 'AGREE'" type="success">已接受预约</el-tag>
            <el-tag v-if="formData.status == 'REJECT'" type="danger">拒绝预约</el-tag>
            <el-tag v-if="formData.status == 'UNDERWAY'" type="info">进行中</el-tag>
            <el-tag v-if="formData.status == 'FINISHED'" type="danger">已结束</el-tag>
            <el-tag v-if="formData.status == 'RATED'" type="danger">已评价</el-tag>
            <el-tag v-if="formData.status == 'CANCELED'" type="danger">已取消</el-tag>
          </template>
        </el-form-item>
        <el-form-item prop="status" label="教室容纳人数" align="center">
          <el-text>{{ formData?.teacherDTO?.officeCapacity }}</el-text>
        </el-form-item>
        <el-form-item prop="studentDTO.nickname" label="预约者（学生）" align="center">
          <el-space wrap>
            <el-avatar :size="40" :src="formData?.studentDTO?.avatar" />
            <el-text>{{ formData?.studentDTO?.nickname }}</el-text>
          </el-space>
        </el-form-item>
        <el-form-item prop="teacherDTO.nickname" label="预约者（学生）" align="center">
          <el-space>
            <el-avatar :size="40" :src="formData?.teacherDTO?.avatar" />
            <el-text>{{ formData?.teacherDTO?.nickname }}</el-text>
          </el-space>
        </el-form-item>
        <el-form-item prop="times" label="活动时间" align="center">
          <el-date-picker
            v-model="formData.times"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <!--              <el-form-item prop="rejectReason" label="拒绝原因">-->
        <!--                  <el-input :disabled="handleOrderType=='AGREE'" :placeholder="handleOrderType=='AGREE' ? '当前接受预约无需填写拒绝理由' : '请填写拒绝预约理由'" v-model="formData.rejectReason"></el-input>-->
        <!--              </el-form-item>-->
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="handleOrderUpdate" :loading="loading">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogVisible"
      :title="handleOrderType == 'AGREE' ? '接受预约' : '拒绝预约'"
      @closed="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" label-width="140px" label-position="left">
        <el-form-item prop="id" label="订单ID">
          <el-input v-model="formData._id" disabled />
        </el-form-item>
        <el-form-item prop="rejectReason" label="拒绝原因">
          <el-input
            :disabled="handleOrderType == 'AGREE'"
            :placeholder="handleOrderType == 'AGREE' ? '当前接受预约无需填写拒绝理由' : '请填写拒绝预约理由'"
            v-model="formData.rejectReason"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate" :loading="loading">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="commentVisible" title="评价本次预约" @closed="resetCommentInfo" width="30%">
      <el-form
        ref="commentFormRef"
        :model="commentInfo"
        :rules="commentFormRules"
        label-width="140px"
        label-position="left"
        v-if="commentInfo?.id"
      >
        <el-form-item prop="id" label="订单ID">
          <el-input v-model="commentInfo._id" disabled />
        </el-form-item>
        <el-form-item prop="teacherDTO" label="评价对象（教师）">
          <el-space>
            <el-avatar :size="40" :src="commentInfo?.teacherDTO?.avatar" />
            <el-text>{{ commentInfo?.teacherDTO?.nickname }}</el-text>
          </el-space>
        </el-form-item>
        <el-form-item prop="studentDTO" label="评价者（学生）">
          <el-space>
            <el-avatar :size="40" :src="commentInfo?.studentDTO?.avatar" />
            <el-text>{{ commentInfo?.studentDTO?.nickname }}</el-text>
          </el-space>
        </el-form-item>
        <el-form-item prop="rate" label="评分">
          <el-rate v-model="commentInfo.rate" :disabled="!isEdit" allow-half />
        </el-form-item>
        <el-form-item prop="content" label="评价">
          <el-input
            maxlength="500"
            :show-word-limit="true"
            v-model="commentInfo.content"
            style="width: 240px"
            autosize
            type="textarea"
            :disabled="!isEdit"
            placeholder="快给本次预约写下你的体验评价吧！"
          />
        </el-form-item>
      </el-form>

      <el-empty v-else description="评论已被删除" />

      <template #footer v-if="isEdit">
        <el-button @click="commentVisible = false">取消</el-button>
        <el-button type="primary" @click="createComment" :loading="loading">确认</el-button>
      </template>
      <template #footer v-else>
        <el-button @click="commentVisible = false">关闭</el-button>
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
