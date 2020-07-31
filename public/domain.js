module.exports = {
    baseUrl: "http://localhost",
    permission: true,
    menu: [
        {
            icon: "el-icon-setting",
            name: "系统管理",
            type: "trunk",
            index: "manager",
            children: [
                {
                    index: "usermanager",
                    name: "人员管理",
                    type: "leaf"
                },
                {
                    index: "rolemanager",
                    name: "角色管理",
                    type: "leaf"

                }
            ]
        },
        {
            icon: "el-icon-setting",
            name: "用户中心",
            index: "center",
            type: "trunk",
            children: [
                {
                    index: "1",
                    name: "我的工作台",
                    type: "leaf"
                },
                {
                    index: "2",
                    name: "我的信息",
                    type: "leaf"
                }
            ]
        }
    ]
}