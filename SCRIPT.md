## 데이터 덤프 스크립트
LC_ALL=C mongodump -h m.onweekend.co.kr -u admin -p password -d onweekend
LC_ALL=C mongorestore -u admin -p password --drop


## 파일 압축
tar -zcvf archive.tar.gz source_files


## 파일 압축 해제
tar -zxvf filename.tar.gz


## 파일 받기
curl cloud.haroopress.com/mdb.tar.gz -O