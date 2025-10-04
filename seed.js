const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database(path.join(__dirname,'data.sqlite'));
const saltRounds = 10;

function run(sql, params=[]) {
  return new Promise((res, rej) => db.run(sql, params, function(err){ if(err) rej(err); else res(this); }));
}

(async () => {
  try {
    const adminPass = await bcrypt.hash('adminpass', saltRounds);
    const staffPass = await bcrypt.hash('staffpass', saltRounds);
    await run('INSERT OR IGNORE INTO users (id,username,password_hash,role) VALUES (?,?,?,?)', [uuidv4(),'admin',adminPass,'admin']);
    await run('INSERT OR IGNORE INTO users (id,username,password_hash,role) VALUES (?,?,?,?)', [uuidv4(),'registrar',staffPass,'staff']);

    const doc1 = uuidv4();
    const doc2 = uuidv4();
    await run('INSERT OR IGNORE INTO doctors (id,name,specialty,phone,email) VALUES (?,?,?,?,?)', [doc1, 'Д-р Анна Смирнова', 'Терапевт', '+7 (900) 555-01-01', 'a.smirnova@smotrodel.test']);
    await run('INSERT OR IGNORE INTO doctors (id,name,specialty,phone,email) VALUES (?,?,?,?,?)', [doc2, 'Д-р Сергей Ковалёв', 'Хирург', '+7 (900) 555-02-02', 's.kovalev@smotrodel.test']);

    const svc1 = uuidv4();
    const svc2 = uuidv4();
    await run('INSERT OR IGNORE INTO services (id,code,name,duration_minutes,price) VALUES (?,?,?,?,?)', [svc1,'SRV-01','Приём терапевта',20,0]);
    await run('INSERT OR IGNORE INTO services (id,code,name,duration_minutes,price) VALUES (?,?,?,?,?)', [svc2,'SRV-02','Консультация хирурга',30,0]);

    const today = new Date().toISOString().slice(0,10);
    await run('INSERT OR IGNORE INTO schedules (id,doctor_id,date,start_time,end_time) VALUES (?,?,?,?,?)', [uuidv4(), doc1, today, '09:00', '13:00']);
    await run('INSERT OR IGNORE INTO schedules (id,doctor_id,date,start_time,end_time) VALUES (?,?,?,?,?)', [uuidv4(), doc1, today, '14:00', '18:00']);
    await run('INSERT OR IGNORE INTO schedules (id,doctor_id,date,start_time,end_time) VALUES (?,?,?,?,?)', [uuidv4(), doc2, today, '10:00', '14:00']);

    const p1 = uuidv4();
    const p2 = uuidv4();
    await run('INSERT OR IGNORE INTO patients (id,first_name,last_name,birth_date,phone,email,doc_number,created_at) VALUES (?,?,?,?,?,?,?,datetime(\'now\'))', [p1,'Иван','Иванов','1985-05-12','+7 (900) 111-22-33','ivan.iv@example.test','AB123456']);
    await run('INSERT OR IGNORE INTO patients (id,first_name,last_name,birth_date,phone,email,doc_number,created_at) VALUES (?,?,?,?,?,?,?,datetime(\'now\'))', [p2,'Мария','Соколова','1990-07-01','+7 (900) 222-33-44','m.sokolova@example.test','CD654321']);

    await run('INSERT OR IGNORE INTO appointments (id,patient_id,doctor_id,service_id,scheduled_at,status,queue_number,created_at) VALUES (?,?,?,?,?,?,?,datetime(\'now\'))', [uuidv4(),p1,doc1,svc1,today + 'T09:30:00','scheduled',1]);
    await run('INSERT OR IGNORE INTO appointments (id,patient_id,doctor_id,service_id,scheduled_at,status,queue_number,created_at) VALUES (?,?,?,?,?,?,?,datetime(\'now\'))', [uuidv4(),p2,doc2,svc2,today + 'T10:15:00','scheduled',1]);

    console.log('Seed done. Logins: admin/adminpass , registrar/staffpass');
    db.close();
  } catch (err) {
    console.error(err);
    db.close();
  }
})();
