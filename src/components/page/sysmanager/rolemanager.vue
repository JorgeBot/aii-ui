<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>角色管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="primary" @click="addRoleVisible=true">新建角色</el-button>
                <el-button type="primary" @click="patchMenusAndResources">保存</el-button>
            </div>
            <div class="content">
                <!-- 角色列表-->
                <el-table
                        :data="role"
                        border
                        highlight-current-row
                        class="roles"
                        ref="multipleTable"
                        max-height="425"
                        @row-click="getMenus"
                >
                    <el-table-column prop="roleName" label="角色名" width="177" align="center"></el-table-column>
                    <el-table-column label="操作" width="120" align="center">
                        <template slot-scope="scope">
                            <el-button
                                    type="text"
                                    icon="el-icon-edit"
                                    @click="patchRole(scope.$index, scope.row)"
                            >编辑
                            </el-button>
                            <el-button
                                    type="text"
                                    icon="el-icon-delete"
                                    class="red"
                                    @click="handleDelete(scope.$index, scope.row)"
                            >删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 菜单树-->
                <div class="menus">
                    <h6>菜单</h6>
                    <el-tree
                            :data="menuTree"
                            show-checkbox
                            default-expand-all
                            @node-click="getResources"
                            node-key="name"
                            ref="menu"
                            :default-checked-keys="checkedNode"
                            :props="defaultProps">
                    </el-tree>
                </div>
                <!-- 资源树-->
                <div class="resources">
                    <h6>资源</h6>
                    <el-tree
                            :data="resources"
                            default-expand-all
                            show-checkbox
                            node-key="name"
                            ref="resource"
                            :default-checked-keys="checkedResources"
                            :props="defaultProps">
                    </el-tree>
                </div>

            </div>
            <!-- 新增modal-->
            <el-dialog title="新建角色" :visible.sync="addRoleVisible" ref="addUserForm" v-dialogDrag width="300">
                <el-form :model="roleForm" :rules="roleFormRule">
                    <el-form-item label="角色名" prop="username">
                        <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
                    </el-form-item>

                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="addRoleVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveRole">确 定</el-button>
                </div>
            </el-dialog>
            <!-- 修改modal-->
            <el-dialog
                    title="修改信息"
                    :visible.sync="editRoleVisible"
                    ref="editUserForm"
                    v-dialogDrag
            >
                <el-form :model="editRoleForm" :rules="editRoleRule" ref="editUserForm">
                    <el-form-item label="角色名" :label-width="300" prop="username">
                        <el-input v-model="editRoleForm.roleName" autocomplete="off"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="editRoleVisible=false">取 消</el-button>
                    <el-button type="primary" @click="editRole">确 定</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>
<script>
    import axios from 'axios'
    import qs from 'qs'

    export default {
        data() {
            return {
                role: [],
                menuTree: [],
                checkedNode: [],
                selectedRoleId: '',
                resources: [],
                checkedResources: [],
                addRoleVisible: false,
                roleForm: {
                    roleName: '',
                },
                roleFormRule: {
                    roleName: [
                        {required: true, message: "请输入角色名", trigger: "blur"}
                    ],
                },
                editRoleVisible: false,
                editRoleForm: {
                    roleName: '',
                },
                editRoleRule: {
                    roleName: [
                        {required: true, message: "请输入角色名", trigger: "blur"}
                    ],
                },
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
            };
        }
        ,
        methods: {
            getRoles() {
                axios.get('role').then(res => {
                    this.role = res.data
                })
            },
            getMenus(row, col, env) {
                if (col.label === "角色名") {
                    this.selectedRoleId = row.id
                    axios.get(`/role/${row.id}/menus`).then(res => {
                        this.menuTree = res.data.menuTree;
                        this.checkedNode = res.data.checkedNode;
                        this.resources = []
                    })
                }
            },
            getResources(obj, node, self) {
                this.resources = []
                let _this = this
                if (obj.isLeaf) {
                    new Promise(function (resolve, reject) {
                        axios.get(`/role/${_this.selectedRoleId}/menu/${obj.id}/resources`).then(res => {
                            res.data.resources.forEach(e => {
                                _this.resources.push({name: e})
                            })
                            resolve(res.data.checkedNode)
                        })
                    }).then(checkedNode => {
                        _this.checkedResources = checkedNode
                    })
                }
            },
            saveRole() {
                axios.post('role', qs.stringify(this.roleForm)).then(res => {
                    this.$message({
                        message: '保存成功',
                        type: 'success'
                    });
                    this.addRoleVisible = false
                    this.getRoles()
                }).catch(err => {
                    this.$message.error('保存失败')
                })
            },
            patchMenusAndResources() {
                let menus = this.$refs.menu.getCheckedKeys()
                let resources = this.$refs.resource.getCheckedKeys()
                axios.patch(`role/${this.selectedRoleId}/menus`, menus).then(res => {
                    axios.patch(`role/${this.selectedRoleId}/resources`, resources).then(r => {
                        this.$message({
                            message: '保存成功',
                            type: 'success'
                        });
                    }).catch(error => {
                        this.$message.error('保存资源时出错')
                    })
                }).catch(err => {
                    this.$message.error('保存菜单时出错')
                })
            },
            patchRole(index, row) {
                this.editRoleVisible = true;
                this.editRoleForm = Object.assign({}, row);
            },
            editRole() {
                axios.patch(`role/${this.editRoleForm.id}`, qs.stringify(this.editRoleForm)).then(res => {
                    this.$message({
                        message: '修改成功',
                        type: 'success'
                    });
                    this.editRoleVisible = false;
                    this.getRoles()
                }).catch(err => {
                    this.$message.error('修改失败')
                })
            }
        },
        mounted() {
            this.getRoles();
        }
    }
    ;
</script>
<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .content {
        display: flex;
        justify-content: space-between;
        flex-wrap: nowrap;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .roles {
        flex: 0 0 298px;
    }

    .menus {
        border-style: solid;
        border-width: 2px;
        border-color: #f1f3f8;
        flex: 0 0 300px;
    }

    .resources {
        border-style: solid;
        border-width: 2px;
        border-color: #f1f3f8;
        flex: 0 0 300px;
    }

    h6 {
        padding: 8px;
        font-size: 12px;
        color: #969ba6;
        width: 300px;
        border-bottom-style: solid;
        border-width: 2px;
        border-color: #f1f3f8;
        margin-bottom: 10px;
        text-align: center;
    }

    /deep/ .el-table__body-wrapper::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    /deep/ .el-table__body-wrapper::-webkit-scrollbar-thumb {
        background-color: #ddd;
        border-radius: 3px;
    }
</style>

