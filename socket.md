# การทำงานของ Socket.IO ใน MERN-CHAT

โปรเจกต์ MERN-CHAT มีการใช้งาน Socket.IO สำหรับสร้างฟีเจอร์ Real-time 2 ส่วนหลักๆ คือ **สถานะออนไลน์ของผู้ใช้ (Online Status)** และ **การส่งข้อความแชท (Real-time Messaging)**

ระบบถูกออกแบบโดยแบ่งหน้าที่ระหว่าง Server และ Client อย่างชัดเจน โดยฝั่ง Client จะผูก Socket ไว้กับ Zustand Store เพื่อให้ทุก Component เรียกใช้ได้ง่าย

---

## 1. ฝั่ง Server (`server/lib/socket.js`)

ไฟล์นี้เป็นศูนย์กลางในการตั้งค่าและการจัดการ Socket ของฝั่ง Backend

### 1.1 การตรวจสอบและเก็บค่าการเชื่อมต่อ (UserSocketMap)

- ทันทีที่มีการ Connect ระบบจะดึง `userId` ผ่าน `socket.handshake.query.userId`
- นำมาจับคู่กับ `socket.id` (ID ชั่วคราวของ connection) แล้วบันทึกลงใน Array `userSocketMap`
  _(รูปแบบคือ `userSocketMap[userId] = socket.id`)_
- ประโยชน์คือ ทำให้เซิร์ฟเวอร์รู้เสมอว่า "ผู้ใช้งานคนนี้ กำลังเชื่อมต่ออยู่ที่ท่อไหน" เพื่อให้ส่งข้อมูลกลับไปหาได้ถูกคน

### 1.2 เหตุการณ์ (Events) ที่ Server จัดการ

- **เมื่อมีการเชื่อมต่อ (Connection):** เซิร์ฟเวอร์จะกระจาย (Broadcast) รายชื่อคนที่ออนไลน์ทั้งหมดผ่าน Event `"getOnlineUsers"` ด้วยคำสั่ง `io.emit` ทำให้ทุกคนในระบบเห็นว่ามีใครออนไลน์บ้าง
- **เมื่อผู้ใช้ตัดการเชื่อมต่อ (Disconnect):** ระบบจะลบ `userId` นั้นออกจาก `userSocketMap` เพื่อรักษาความถูกต้องของข้อมูล

### 1.3 การยิงแจ้งเตือนแชทใหม่ (`server/controllers/message.controller.js`)

เมื่อมีการเรียก API สร้างข้อความใหม่ (`sendMessage`) สำเร็จ:

1. เซิร์ฟเวอร์จะหา Socket ID ของผู้รับข้อความ ด้วยฟังก์ชัน `getRecipientSocketId(recipientId)`
2. หากผู้รับคนนั้นออนไลน์อยู่ (มี Socket ID) ระบบจะส่ง Event `"newMessage"` เฉพาะบุคคลเท่านั้น (Private Emitting) ด้วยคำสั่ง `io.to(recipientSocketId).emit("newMessage", newMessage);`

---

## 2. ฝั่ง Client (`client/src/store/`)

ฝั่ง Frontend ใช้ Zustand เป็นพระเอกในการจัดการ State ของ Socket โดยแบ่งเป็น 2 Store หลัก

### 2.1 การจัดการการเชื่อมต่อ (`useAuthStore.js`)

ฟังก์ชันทำหน้าที่จัดการเรื่องการต่อและตัด Socket โดนตรง

- **`connectSocket()`:**
  - ทำงานอัตโนมัติเมื่อผู้ใช้งาน Login หรือ Refresh หน้าเว็บแล้วยัง Login อยู่
  - ไปสร้าง instance `io(...)` ชี้ไปที่ Backend URL พร้อมฝาก `userId` พ่วงไปใน Query
  - คอยดักฟัง (Listen) Event `"getOnlineUsers"` ถ้ารายชื่อมีการอัปเดต ก็จะจับไปใส่ State `onlineUsers` ของระบบ
- **`disconnectSocket()`:**
  - สั่ง `socket.disconnect()` เมื่อผู้ใช้กด Logout เพื่อปิดท่อการเชื่อมต่อให้สมบูรณ์

### 2.2 การรับข้อความ Real-time (`useChatStore.js`)

ส่วนต่อขยายสำหรับหน้าแชท มีฟังก์ชันดักรับข้อความโดยเฉพาะ (Subscribe/Unsubscribe Pattern)

- **`subscribeToMessages()`:**
  - ฟังก์ชันนี้จะไปดึง `socket` จาก AuthStore มาทำงาน
  - ดักฟัง Event `"newMessage"`
  - มี**เงื่อนไขการกรองข้อความ (Filter)**: ระบบจะเช็คว่าข้อความที่วิ่งกระดอนเข้ามา เป็นข้อความของคนที่เรากำลังเลือกแชทอยู่ไหม (Selected User) ถ้าไม่ใช่ ก็จะไม่เอามาต่อในช่องแชท (ป้องกันข้อความไปขึ้นผิดห้อง)
  - ถ้าใช่ ก็จะคลาย (Spread) ข้อความเดิมใน State `messages` แล้วเอาของใหม่ต่อท้ายทันที ส่งผลให้หน้าแชทเด้งขึ้นมาโดยไม่ต้องกด Refresh
- **`unsubscribeFromMessages()`:**
  - สั่งยกเลิกดักฟัง `socket.off("newMessage")` ทันทีที่เราสลับคนแชทหรือหนีไปหน้าอื่น ป้องกันปัญหา Memory Leak หรือการรับ Event ซ้ำซาก
