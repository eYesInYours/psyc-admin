<script setup lang="ts">
import { computed, ref } from "vue"
import { useUserStore } from "@/store/modules/user"
import { searchTableDataApi } from "@/api/table/classroom"
import { getUserInfoApi, updaterUserInfoApi } from "@/api/login"
import { uplaodApi } from "@/api/util"
import { RefreshRight } from "@element-plus/icons-vue"
import { ElMessage, UploadProps } from "element-plus"

const userStore = useUserStore()
const loading = ref<boolean>(false)

const user = ref({})

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

remoteMethod("")

const getUserInfo = async () => {
  const { data } = await getUserInfoApi(userStore.token)
  user.value = data
  userStore.user = user.value
  ElMessage.success("操作成功")
}
getUserInfo()

const updateUserInfo = async () => {
  try {
    loading.value = true
    // uploadRef.value!.submit()
    c
    await updaterUserInfoApi(user.value)
    await getUserInfo()
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

//#region 头像上传
import type { UploadInstance } from "element-plus"
const uploadRef = ref<UploadInstance>()
const handleAvatarSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  console.log(uploadFile)
  user.value.avatar.value = URL.createObjectURL(uploadFile.raw!)
}

const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
  console.log(rawFile)
  if (rawFile.type !== "image/jpeg") {
    ElMessage.error("Avatar picture must be JPG format!")
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("头像文件不能超过10M")
    return false
  }
  return true
}

const avatarTempUrl = computed(() => {
  const avatarFileList = user.value?.avatarFileList
  if (avatarFileList?.length) {
    if (avatarFileList[0].raw) {
      return URL.createObjectURL(user.value.avatarFileList?.[0].raw)
    } else {
      return URL.createObjectURL(user.value.avatarFileList[0])
    }
  }
  return ""
})

const handleExceed: UploadProps["onExceed"] = (files) => {
  console.log("files", files[0])
  user.value.avatarFileList[0] = {
    name: files[0].name,
    percentage: files[0].percentage,
    size: files[0].size,
    raw: files[0]
  }
}

//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" body-style="padding: 40px 600px">
      <el-form ref="formRef" :model="user" label-width="100px" label-position="left">
        <el-form-item prop="id" label="用户ID">
          <el-input v-model="user.id" disabled placeholder="自动生成，不用输入" />
        </el-form-item>
        <el-form-item prop="avatar" label="用户头像">
          <el-upload
            ref="uploadRef"
            class="avatar-uploader"
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :limit="1"
            :auto-upload="false"
            :before-upload="beforeAvatarUpload"
            v-model:file-list="user.avatarFileList"
            :show-file-list="false"
            :on-exceed="handleExceed"
          >
            <el-image
              v-if="user.avatarFileList?.length"
              style="width: 100px; height: 100px"
              :src="avatarTempUrl"
              fit="cover"
            />
            <el-image v-else-if="user.avatar" style="width: 100px; height: 100px" :src="user.avatar" fit="cover" />
            <!--          <img v-if="user.avatarFileList?.length || user.avatar" :src="avatarTempUrl || user.avatar" class="avatar" />-->
            <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item prop="username" label="账号">
          <el-input v-model="user.username" :disabled="!!user.id" placeholder="请输入" width="100px" />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            show-password
            type="password"
            maxlength="14"
            show-word-limit
            v-model="user.password"
            placeholder="请输入"
          />
        </el-form-item>
        <el-form-item prop="nickname" label="昵称">
          <el-input v-model="user.nickname" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="sex" label="性别">
          <el-radio-group v-model="user.sex" class="ml-4">
            <el-radio value="MAN">男</el-radio>
            <el-radio value="WOMAN">女</el-radio>
            <el-radio value="">不愿透露</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="user.type === 'TEACHER'" prop="teacherOffice" label="办公地点">
          <el-cascader
            :disabled="user.type !== 'TEACHER'"
            v-model="user.officeIds"
            :options="classrooms"
            :props="{ expandTrigger: 'hover' as const }"
          />
        </el-form-item>
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="user.phone" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="intro" label="简介">
          <el-input :autosize="{ minRows: 3, maxRows: 5 }" type="textarea" v-model="user.intro" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <el-tooltip content="刷新当前页">
        <el-button type="primary" :icon="RefreshRight" circle @click="getUserInfo" />
      </el-tooltip>
      <el-button type="primary" @click="updateUserInfo" :loading="loading">修改</el-button>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
#user-box {
  padding: 60rpx;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
