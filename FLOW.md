# 🔄 System Flow - MERN-CHAT 

เอกสารนี้อธิบายลำดับการทำงาน (Flow) หลักภายในโปรเจกต์ MERN-CHAT เพื่อให้เห็นภาพรวมว่าข้อมูลวิ่งจาก Client (React) ไปยัง Server (Node.js/Express) และเชื่อมต่อกับ Database (MongoDB) อย่างไร 

---

## 1. 🔐 Flow การล็อคอินและการยืนยันตัวตน (Authentication Flow)
ทุกครั้งที่ผู้ใช้งานจะเข้าสู่ระบบหรือเปิดแอปพลิเคชัน จะต้องผ่าน Flow นี้ก่อนเสมอ

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (React/Zustand)
    participant B as Backend (Express API)
    participant D as Database (MongoDB)

    U->>F: กรอกข้อมูล (Email, Password) และกด Login
    F->>B: ส่ง Request -> POST /user/signin
    B->>D: ค้นหา Email และตรวจสอบรหัสผ่าน (Bcrypt)
    D-->>B: ส่งผลลัพธ์กลับมา
    
    alt Login สำเร็จ (Success)
        B->>B: สร้าง Token JWT และสร้าง HTTP-Only Cookie
        B-->>F: ส่ง Response ข้อมูลผู้ใช้กลับไป (Status 200)
        F->>F: เก็บข้อมูลลง State `authUser` (useAuthStore)
        F->>B: สั่ง `connectSocket()` เปิดท่อ Socket ทันที
        F-->>U: พาไปหน้า Home (แชท)
    else Login ล้มเหลว (Failed)
        B-->>F: ส่ง Error Message กลับไป (Status 4xx)
        F-->>U: แสดง Toast แจ้งเตือนข้อผิดพลาด
    end
```

---

## 2. 💬 Flow การดึงประวัติการแชท (Chat History Flow)
เมื่อผู้ใช้กดเลือกแชทกับเพื่อนจาก Sidebar ทางซ้าย ระบบจะไปดึงประวัติการคุยเก่าๆ ของทั้งคู่ออกมา

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (useChatStore)
    participant API as Backend (Message Controller)
    participant DB as MongoDB

    U->>F: กดชื่อเพื่อนบน Sidebar (`setSelectedUser`)
    F->>API: ส่ง Request -> GET /message/:id (ID ของเพื่อน)
    API->>DB: ค้นหาข้อความทั้งหมดที่ `sender` และ `recipient` ตรงกับ 2 คนนี้
    DB-->>API: สรุปผลลัพธ์ข้อความ (Messages Array)
    API-->>F: ส่งประวัติแชทย้อนหลังคืนให้ Client
    F->>F: บันทึกลง State `messages`
    F->>F: สำคัญมาก: เรียกฟังก์ชัน `subscribeToMessages()` เพื่อดักฟังข้อความใหม่
    F-->>U: แสดงผลประวัติการแชทหน้าจอ
```

---

## 3. 🚀 Flow การส่งข้อความแบบ Real-time (Real-time Messaging Flow)
หัวใจสำคัญของโปรเจกต์คือ เมื่อพิมพ์ข้อความแล้ว อีกฝั่งต้องเห็นทันทีโดยไม่ต้อง Refresh ส่วนนี้จะใช้ **REST API คู่กับ Socket.IO**

```mermaid
sequenceDiagram
    participant S as Sender (ผู้ส่ง)
    participant F as Frontend
    participant API as Backend API
    participant SOC as Socket.IO Server
    participant DB as MongoDB
    autonumber

    S->>F: พิมพ์ข้อความและกด "Send"
    F->>API: ส่ง Request -> POST /message/send/:id 
    API->>DB: บันทึกข้อความลง Database (Save to Cloudinary หากเป็นรูป)
    DB-->>API: ยืนยันว่าฝากสำเร็จ ได้ `newMessage`
    API-->>F: แฟนฝั่งคนส่ง -> ส่ง Status 200 ตอบกลับสำเร็จ 
    F->>F: คนส่งเอาข้อความใหม่ไปต่อท้าย State ตัวเอง -> แชทเด้งฝั่งคนส่ง!
    
    note over API, SOC: --- กระบวนการข้างหลังบ้าน (Background) ---
    API->>SOC: ตรวจสอบหา `socket.id` ของผู้รับจาก `userSocketMap`
    
    alt ผู้รับกำลังออนไลน์
        SOC->>SOC: ยิง Event "newMessage" เจาะจงไปที่ Socket ID นั้นๆ
        SOC-->>ผู้รับ (Recipient): ส่ง Packet หน้าตาข้อความใหม่ไปให้
        ผู้รับ (Recipient)->>ผู้รับ (Recipient): ดักฟังและต่อท้าย State `messages` ทันที -> แชทเด้งฝั่งคนรับ!
    else ผู้รับออฟไลน์ 
        SOC->>SOC: (ไม่ทำอะไร) เมื่อคนรับออนไลน์ทีหลัง ก็จะโหลดจาก Flow ย้อนหลังได้เอง
    end
```

---

## 4. 🟢 Flow สถานะผู้ใช้งาน (Online Status Flow)
เมื่อเสียบสาย Socket.IO สำเร็จฝั่ง Server จะ Broadcast เพื่อบอกชาวบ้านว่าใครออนไลน์บ้าง

```mermaid
sequenceDiagram
    participant User1 as นาย A (พึ่งเข้าแอป)
    participant Auth as Frontend (useAuthStore)
    participant SOC as Socket Server
    participant User2 as นาย B (นั่งออนไลน์อยู่แล้ว)

    User1->>Auth: ตรวจสอบ CheckAuth หรือ Login โหลดหน้าเว็บขึ้นมา
    Auth->>SOC: สั่ง `connectSocket(userId ของ A)`
    SOC->>SOC: เก็บ A เข้า `userSocketMap`
    SOC->>SOC: Socket ส่ง Event Broadcast ➔ "getOnlineUsers" ทิ้งออกไปทั้งระบบ
    SOC-->>User2: ส่ง Array ปัจจุบัน (มี A อยู่ในนั้น) ไปให้ B
    User2->>User2: อัปเดต State `onlineUsers` ของตัวเอง -> B เห็นจุดเขียวข้างชื่อ A ขึ้นมา!
    SOC-->>User1: ส่ง Array ตัวเองกลับมา
    User1->>User1: A ก็เห็นเพื่อนคนอื่นๆ (จุดเขียว) เหมือนกัน!
```

---

## 📌 สรุปหลักการไหลของข้อมูล (General Rules)
- ข้อมูลจำพวกการดึงข้อมูลตั้งต้น (Fetch data), แก้ไขโพรไฟล์, เลื่อนประวัติ ลงคลัง (Persistence) ทั้งหมดจะยิงผ่าน **REST API** (axios)
- ข้อมูลที่มีการยิงแจ้งเตือน ข้อมูลที่วิ่งเข้ามาแทรกแบบด่วนจี๋ (Notification, Chat) ทั้งหมดจะวิ่งผ่านท่อ **Socket.IO** (Listen to events)
- **Zustand** เสมือนตัวกลางบัญชาการ ที่เมื่อรับของมาจาก API หรือ Socket แล้ว จะเก็บลงกล่อง (State) แล้วกระจาย (Render) ให้ทุก Component หน้าเว็บเห็นข้อมูลชุดเดียวกันทันที
