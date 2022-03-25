const fs = require('fs');
const path = require('path');
const efs = require('fs-extra');
const yaml = require('json-to-pretty-yaml');
const logger = require('../utils/log');
const git = require('../utils/git');
const { spawnSync } = require('child_process');

const customDir= "./terraform/custom/";
const ansible= "ansible";
const ansibleTempl= "./template/ansible/"
const envVars = "env_vars"
const varsYml = "vars.yml"

async function makeYamlFile(json,destPath){
    const data= yaml.stringify(json);
    return await fs.promises.writeFile(destPath,data);
}
async function makePlayBooks(information){
    console.timeStamp('makePlayBook');
    
    await Promise.all([
        information.forEach(item=> {
            return makeYamlFile(item)
        })
    ]);
    console.timeStamp('makePlayBook');
}

async function LancherService(data) {


    // provision

    //1. git clone  // update 하면 api 로 다운로드 , terraform, ansible

    // cat resource 를 정의한다.
    // resource validate array
    //2. terraform // main foler 에서 하나로 동작.
    // copy  te  usertemplate
    // user/projecta/cust  git init push
    // user/porjectb/cusm  git init push
    //3. 테라폼 완료 tfstate 파일에 resource validate array  관련 string check

    //4. ansible 은 pipe 가능. playbook  yml 파일은 형태별로 미리저장. db에서 정보 get
    //5. ansible이 동작한다고 하면 source clone
    //6. ansible 에서 ci/cd option

    // s3 lamda
    // https://github.com/FitnessKeeper/terraform-lambda/blob/master/service.py


// {
// "ansibleInfo": [
//     { "id": 1, "dest": "frontend",   "role": "codeDeploy" },
//     { "id": 2, "dest": "frontend",   "role": "nginx" },
//     { "id": 3, "dest": "frontend",   "role": "nodejs" },
//     { "id": 1, "dest": "backend",   "role": "codeDeploy" },
//     { "id": 4,"dest": "backend",   "role": "openjdk" },
//     { "id": 5,"dest": "backend",   "role": "gradle" }
// ],

    //maintf 파일만들때 각옵션 cat 사용 고려


    //for test
    console.time("launcher/apply");
    // 1. template copy
    console.time('copyTerraform');
    const {awsAccessKey,awsSecretKey,region,ansibleEnabled,gitClonePw,gitCloneUser,infraType} = data?.terraformInfo;
    const ansibleInfo = data?.ansibleInfo;
    await templateCopy(awsAccessKey,region);
    // db 상태 업데이트
    console.timeEnd('copyTerraform');
    // 2. ansible playbook var.yml 생성

    console.time('makePlayBook');
    // destPath + File.separator + "env_vars" + File.separator + "vars.yml";
    const playBook = `${customDir}${path.sep}${awsAccessKey}${path.sep}${region}${path.sep}${ansible}${path.sep}${envVars}${path.sep}${varsYml}`;

    // 2-1 정의 된 role 을 인자로 준다.
    // {
    //     "ansibleInfo":[
    //         {"id": 1, "dest": "frontend", "role": "codeDeploy"},
    //         {"id": 2, "dest": "frontend", "role": "nginx"},
    //         {"id": 3, "dest": "frontend", "role": "nodejs"},
    //         {"id": 1, "dest": "backend", "role": "codeDeploy"},
    //         {"id": 4, "dest": "backend", "role": "openjdk"},
    //         {"id": 5, "dest": "backend", "role": "gradle"}
    //     ]
    // }

    // 2-2 정의 된 role과 동작을 매칭 시킨다.
    for( let i=0;i<ansibleInfo?.length;i++){
        logger.info("id : ", ansibleInfo[i].id," dest : ",ansibleInfo[i].dest," role : ",ansibleInfo[i].role);
    }
    // 2-3 json 생성.
    const test = {
        "nginx": {
            "user": "ubuntu",
            "debian_version": "nginx"
        },
        "openjdk": {
            "debian_version": "11"
        },
        "node": {
            "debian_version": "14.x"
        },
        "awscli": {
            "user": "ubuntu",
            "awsAccessKey": "AKIA4BPI76PSJTV7XQIH",
            "awsSecretKey": "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",
            "region": "ap-northeast-2"
        },
        "codedeploy": {
            "aws_region": "ap-northeast-2"
        },
        "gradle": {
            "debian_version": "7.1.1",
            "debian_dir": "/opt"
        }
    };
    // 2-4 playbook 을 위한 yaml 파일을 생성한다.
    const ansibleVar = yaml.stringify(test);
    await fs.promises.writeFile(playBook, ansibleVar);
    // db 상태 업데이트

    // 3. play book 생성 , backend , frontend 용
    const frontPlayBook= `${ansibleTempl}${path.sep}playbooks${path.sep}front-playbook.yml`;
    const backendPlayBook= `${ansibleTempl}${path.sep}playbooks${path.sep}backend-playbook.yml`;

    // 3-1 등록된 RDB role 정보를 호출.
    // 3-2 font 관련 ansible role , dest 값을 RDB role 값과 매칭하여 관련 yml 파일 경로를 찾는다.
    // 3-3 frontPlayBook 을 위한 yaml 파일을 생성한다.
    const frontPlayBookYml = [
        {
            "import_playbook": "../roles/common/tasks/main.yml"
        },
        {
            "import_playbook": "../roles/codeDeploy/tasks/main.yml"
        },
        {
            "import_playbook": "../roles/nginx/tasks/main.yml"
        },
        {
            "import_playbook": "../roles/nodejs/tasks/main.yml"
        }
    ]
    const frontPlayBookYmlFile = yaml.stringify(frontPlayBookYml);
    await fs.promises.writeFile(frontPlayBook, frontPlayBookYmlFile);
    // db 상태 업데이트

    // 3-4 등록된 RDB role 정보를 호출.
    // 3-5 back 관련 ansible role , dest 값을 RDB role 값과 매칭하여 관련 yml 파일 경로를 찾는다.
    // 3-6 BackPlayBook 을 위한 yaml 파일을 생성한다.
    const backendPlayBookYml =[
        {
            "import_playbook": "../roles/common/tasks/main.yml"
        },
        {
            "import_playbook": "../roles/codeDeploy/tasks/main.yml"
        },
        {
            "import_playbook": "../roles/openjdk/tasks/main.yml"
        },
        {
            "import_playbook": "../roles/gradle/tasks/main.yml"
        }
    ]
    const backendPlayBookYmlFile = yaml.stringify(backendPlayBookYml);
    await fs.promises.writeFile(backendPlayBook, backendPlayBookYmlFile);
    console.timeEnd('makePlayBook');
    // db 상태 업데이트

    // 5. terraform 동작별로 실행
    // 5-1. region, acc key , git user/pass 체크
    console.time('validation');
    if(ansibleEnabled == false && !gitClonePw?.length && !gitCloneUser?.length) {
        logger.error(`ansibleEnabled : ${ansibleEnabled} gitClonePw: ${gitClonePw} gitCloneUser: ${gitCloneUser}` );
    }
    console.timeEnd('validation');
    // 5-2 infra
        // 5-2-1 infra 종류별 데이터를 db에서 가져옴.
        console.time('infra');
        const infraKind = [
            {
                id :"2tier",
                path: `/terraform/custom/${awsAccessKey}/${region}/2tier`,
                git : [{type: "backend", url: "https://github.com/sangukKang/cmkp-cicd-app.git"}]
            },
            {
                id :"3tier",  path: `/terraform/custom/${awsAccessKey}/${region}/3tier`,
                git : [
                        {type: "frontend", url: "https://github.com/sangukKang/cmkp-cicd-frontend.git"},
                        {type: "backend", url: "https://github.com/sangukKang/cmkp-cicd-backend.git"}
                    ]
            },
            {
                id :"sample",
                path:`/terraform/custom/${awsAccessKey}/${region}/sample`,
                git : []
            }
        ]
        // 5-2-3 폴더 생성.
        const infra = parseInt(infraType) <=0 ? infraKind.length-1 : parseInt(infraType) -1;
        logger.info(`infra : ${infra}`);
        await Promise.allSettled([
            fs.promises.mkdir(infraKind[infra].path),
            efs.copy("template/terraform/module"                      ,`terraform/custom/${awsAccessKey}/${region}/module`),
            efs.copy("template/terraform/source/infra"                ,`terraform/custom/${awsAccessKey}/${region}/infra`),
            efs.copy("template/terraform/source/resource/route53"     ,`terraform/custom/${awsAccessKey}/${region}/route53`),
            efs.copy("template/terraform/source/resource/acm"         ,`terraform/custom/${awsAccessKey}/${region}/acm`),
            efs.copy("template/terraform/source/resource/common"      ,`terraform/custom/${awsAccessKey}/${region}/common`),
        ])

        // db 상태 업데이트
        // gitclone  backend,frontend,sample
        console.time('git');
        await (async() =>{

            const local =`terraform${path.sep}custom${path.sep}${awsAccessKey}${path.sep}${region}${path.sep}samplecode${path.sep}`;
            let exist = false;
            try{
                exist = fs.accessSync(local,fs.constants.F_OK);
            }catch (e) {
                logger.error("exist : ",exist);
            }

            if(exist) {
                await fs.rm(local,{recursive:true});
            }

            for(let repo=0;repo < infraKind[infra]?.git?.length;repo++) {
                let gitlocal = local;
                const repoPath= infraKind[infra]?.git[repo]?.type == "frontend" ? gitlocal+="frontend" : gitlocal+="backend";
                const repoUrl = infraKind[infra]?.git[repo]?.url;
                logger.info(`git download path : ${repoPath} ,git repo url : ${repoUrl}`);
                git.clone(repoUrl,repoPath,{});
            }
        })();
        console.timeEnd('git');

        const terraformRoot =`template${path.sep}terraform${path.sep}script${path.sep}`;
        const scriptName= 'apply.sh';
        const applyCmd=`${terraformRoot}${scriptName}`;
        // terraform/custom/${awsAccessKey}/${region}/
        // customPath 에 variables.tf.json 생성.

        // child process apply.sh 실행 (custom path, plan.log, informatino )
        const infradata = spawnSync(applyCmd, [`terraform/custom/${awsAccessKey}/${region}/infra/2tier`,awsAccessKey,awsSecretKey,region]);
        console.log('pid infra process : ',infradata.pid);
        console.log('infra stderr : ',infradata.stderr?.toString());
        console.log('infra stdout : ',infradata.stdout?.toString());


        // apply.json  확인 ( tyep == provision_errored or type == apply_errored) or @level == error) 면 실패 , 그외 성공
        // child process kill pid

        // s3 bucket에 terraform/custom/accesskey/region 정부 업로드.

        console.time('amazone s3 upload');
        console.timeEnd('amazone s3 upload');
        console.timeEnd('infra');

    // 5-3 route53
        // path 정보 ('/terraform/custom/accesskey/region/route53')
        // customPath 에 variables.tf.json 생성.
        // child process apply.sh 실행 (custom path, plan.log, informatino )

        const route53 = spawnSync(applyCmd, [`terraform/custom/${awsAccessKey}/${region}/infra/2tier`,awsAccessKey,awsSecretKey,region]);
        console.log('pid infra process : ',route53.pid);
        console.log('infra stderr : ',route53.stderr?.toString());
        console.log('infra stdout : ',route53.stdout?.toString());
         // apply.json  확인 ( tyep == provision_errored or type == apply_errored) or @level == error) 면 실패 , 그외 성공
        // child process kill pid 
        // s3 bucket에 terraform/custom/accesskey/region 정부 업로드.

    // 5-4 acm
        // ns.txt 파일을 읽는다.
        // ResourceRecord list 를 생성한다.
        // aws library 를 이용하여 list 값을 aws route53에 적용한다.
        // get region, acckey, 
        // path 정보 ('/terraform/custom/accesskey/region/acm')
        // customPath 에 variables.tf.json 생성.
        // child process apply.sh 실행 (custom path, plan.log, informatino )
        // const acm = spawnSync(applyCmd, [`terraform/custom/${awsAccessKey}/${region}/infra/2tier`,awsAccessKey,awsSecretKey,region]);
        // console.log('pid infra process : ',acm.pid);
        // console.log('infra stderr : ',acm.stderr?.toString());
        // console.log('infra stdout : ',acm.stdout?.toString());
         // apply.json  확인 ( tyep == provision_errored or type == apply_errored) or @level == error) 면 실패 , 그외 성공
        // child process kill pid 
        // s3 bucket에 terraform/custom/accesskey/region 정부 업로드.

    // 5-5 common
        // ns.txt 파일을 읽는다.
        // ResourceRecord list 를 생성한다.
        // aws library 를 이용하여 list 값을 aws route53에 적용한다.
        // get region, acckey, 
        // path 정보 ('/terraform/custom/accesskey/region/acm')
        // customPath 에 variables.tf.json 생성.
        // child process apply.sh 실행 (custom path, plan.log, informatino )
        // const common = spawnSync(applyCmd, [`terraform/custom/${awsAccessKey}/${region}/infra/2tier`,awsAccessKey,awsSecretKey,region]);
        // console.log('pid infra process : ',common.pid);
        // console.log('infra stderr : ',common.stderr?.toString());
        // console.log('infra stdout : ',common.stdout?.toString());
         // apply.json  확인 ( tyep == provision_errored or type == apply_errored) or @level == error) 면 실패 , 그외 성공
        // child process kill pid 
        // s3 bucket에 terraform/custom/accesskey/region 정부 업로드.

    // 완료시 
    // /terraform/custom/accesskey/region 삭제
    // console.time('deleteTerraform');
    // const regionDir= `${customDir}${path.sep}${awsAccessKey}${path.sep}${region}`;
    // fs.promises.rm(regionDir,{recursive:true});
    // db 상태 업데이트
    console.timeEnd('deleteTerraform');
    console.timeEnd("launcher/apply");
}

async function templateCopy(awsAccessKey,region) {
    const dir = `${customDir}${path.sep}${awsAccessKey}${path.sep}${region}${path.sep}${ansible}`;
    await fs.promises.mkdir(dir,{ recursive: true });
    await efs.copy(ansibleTempl , dir);
}

exports.lancherService= LancherService;
