# รูปแบบการเขียน Function ในโปรเจกต์ MERN-CHAT

ในโปรเจกต์กระบวนการเขียนฟังก์ชันส่วนใหญ่ใช้รูปแบบ Modern JavaScript (ES6+) โดยเฉพาะ **Arrow Functions (`() => {}`)** ควบคู่กับการประมวลผลแบบ **Asynchronous (`async / await`)** และ **Callback Functions** ครับ 

นี่คือข้อมูลสรุปของทุกรูปแบบการเขียนฟังก์ชันที่พบในโปรเจกต์นี้:

---

## 1. Async / Await Arrow Functions (ในฝั่ง Backend / Controllers)
ถูกใช้งานเยอะที่สุดในฝั่ง Server เช่น Express Request Handlers สำหรับการทำงานที่ต้องใช้เวลา เช่น ต่อ Database, อัปโหลดไฟล์, ตรวจสอบรหัสผ่าน 
- **จุดเด่น:** จะมีการครอบการทำงานด้วย `try { ... } catch (error) { ... }` เสมอ เพื่อจัดการ Error และส่ง HTTP Status กลับไปยัง Client

**ตัวอย่างจาก `server/controllers/message.controller.js`:**
```javascript
const sendMessage = async (req, res) => {
  try {
    const { text, file } = req.body;
    // ... กระบวนการบันทึกข้อความ อัปโหลดรูป ฯลฯ
    res.status(200).json(newMessage);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while sending message",
      error: error.message,
    });
  }
};
```

---

## 2. Async / Await Arrow Functions (ในฝั่ง Frontend / Zustand Store)
ในฝั่ง Client (React) State Management หลักคือ `Zustand` ซึ่งจะเก็บ Methods เป็น Arrow Functions ถ้าฟังก์ชันไหนต้องยิง API ก็จะใส่ `async` นำหน้าฟังก์ชันเสมอ
- **จุดเด่น:** จะมีการเรียก `set()` คั่นระหว่างรอ Response (`await`) เพื่อเปลี่ยน Loading State (เช่น กำลังโหลดข้อมูล) และอาจจะอ่าน State เดิมด้วย `get()`

**ตัวอย่างจาก `client/src/store/useAuthStore.js`:**
```javascript
signIn: async (data) => {
  // ตั้งค่า State ว่ากำลัง Login
  set({ isLoggingIn: true }); 
  try {
    const response = await api.post("/user/signin", data); // ยิง API (await)
    set({ authUser: response.data }); // อัปเดตข้อมูลผู้ใช้
    get().connectSocket(); // เรียกใช้งานฟังก์ชันอื่นภายใต้ Store เดียวกัน (Callback-pattern usage)
  } catch (error) {
    toast.error(error.response.data.message || "Log in failed");
  } finally {
    set({ isLoggingIn: false }); // ฟังก์ชันสุดท้ายในกระบวนการ Async
  }
},
```

---

## 3. Callback Functions
ฟังก์ชันประเภทนี้จะถูกโยนเข้าไปเป็น Parameter ของฟังก์ชันอื่น เพื่อรอการประมวลผลในเหตุการณ์ (Events) ที่กำหนด ในโปรเจกต์นี้จะพบใน 2 กรณีหลัก คือ:

### 3.1 Socket.IO Event Listeners
โค้ดที่รอรับข้อมูลจากระบบ Real-time Chat จะรับค่าผ่าน Callback เมื่อมี Event วิ่งเข้ามา
```javascript
// ฝั่ง Client - เมื่อมีคนออนไลน์ ระบบจะส่ง Callback เข้ามาอัปเดต State ทันที
newSocket.on("getOnlineUsers", (userIds) => {
  set({ onlineUsers: userIds }); 
});

// ฝั่ง Server - เมื่อมีการ Connect หรือ Disconnect จาก Client
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});
```

### 3.2 การสร้าง Zustand Store (Callback Initializer)
Zustand จะรับฟังก์ชัน Callback ที่มี `(set, get)` เป็น Argument ซึ่งด้านในจะบรรจุ State ทั้งหมดไว้:
```javascript
export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  // ... state และ functions ต่างๆ
}));
```

---

## 4. Middleware / Higher-order Functions
ฟังก์ชันที่เข้ามาคั่นกลางกระบวนการ Request ก่อนที่จะไปถึง Controller หลัก ถูกใช้ในฝั่ง Backend เพื่อเช็คสิทธิ์การใช้งาน
- **จุดเด่น:** มี parameter `next` เป็น Callback เพื่อส่งต่อกระบวนการ

**ตัวอย่างจาก `server/middlewares/auth.middleware.js`:**
```javascript
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }
    // ... logic ยืนยัน Token ต่างๆ
    req.user = user;
    next(); // เรียก Callback ว่าให้ไปทำ Controller ถัดไปได้
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
```

---

## 5. React Functional Components & Event Handlers
Component ฝั่ง React ถูกเขียนด้วย Functional Components ทั้งหมด และมักจะมีฟังก์ชัน Event Handlers (ขึ้นต้นด้วย `handle...`) ซึ่งถ้าเป็นเรื่องของการเรียก API ภายใน Component ก็จะใส่ `async` ให้อีกที

**ตัวอย่างจากโฟลเดอร์ `client/src/pages/`:**
```javascript
const Login = () => {
  // ดึงฟังก์ชันจาก Zustand Store มา
  const { signIn, isLoggingIn } = useAuthStore();

  // Async Event Handler ตัวอย่าง
  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(formData); // รอจนกว่า SignIn จะสมบูรณ์
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
};
```

---

## สรุปหลักการเขียนในโปรเจกต์นี้
1. **ES6 Arrow Function เสมอ:** โปรเจกต์นี้แทบจะไม่ใช้คำว่า `function xxx()` (Standard Declaration) แต่จะใช้ `const xxx = () => {}` แทนเพื่อให้เป็นมาตรฐานเดียวกัน
2. **จัดการ API ด้วย `async/await`:** หากเป็น I/O ข้าม Network ฝั่ง Server/Client จะใช้ `async / await` เสมอ ไม่ใช้แบบ `.then().catch()` (Promise Chaining)
3. **จัดการ Error ด้วย `Try/Catch` Block:** คู่ขนานกับ Async/Await โค้ดจะถูกครอบด้วยโครงสร้าง Try/Catch ทั้งหมด เพื่อป้องกันเซิร์ฟเวอร์หรือแอปพลิเคชันล่ม
## 4. **Modern `finally` Block:** ในฝั่ง Frontend การตั้งค่า Loading Spinner เช่น `isLoggingIn: true/false` ใช้ภายในบล็อก `finally` เพื่อให้ทำงานไม่ว่าผลจะสำเร็จหรือล้มเหลว
