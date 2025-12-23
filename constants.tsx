import { 
  ShieldAlert, 
  Database, 
  DollarSign, 
  Lock, 
  Mail, 
  Bug, 
  FileWarning, 
  ServerCrash, 
  RadioReceiver, 
  Code, 
  AlertTriangle,
  Cpu,
  Ghost,
  Users,
  Unlock
} from 'lucide-react';
import { InfoCardData } from './types';

export const HERO_TEXT = "การโจมตีทางไซเบอร์ (Cyber Attack) คือความพยายามของบุคคลหรือกลุ่มผู้ไม่หวังดีในการเจาะระบบคอมพิวเตอร์ เครือข่าย หรืออุปกรณ์ดิจิทัลโดยไม่ได้รับอนุญาต เพื่อขโมยข้อมูล, ทำลายระบบ, ขัดขวางการทำงาน, หรือแสวงหาผลประโยชน์ทางการเงิน";

export const GOALS_DATA: InfoCardData[] = [
  {
    title: "การขโมยข้อมูล",
    description: "มุ่งเป้าที่ข้อมูลส่วนตัว (PII), ข้อมูลทางการเงิน, และทรัพย์สินทางปัญญา",
    icon: Database,
    color: "text-blue-400"
  },
  {
    title: "ทำลายหรือขัดขวาง",
    description: "ทำให้ระบบหยุดทำงาน หรือไม่สามารถใช้งานได้ (เช่น DDoS)",
    icon: ServerCrash,
    color: "text-red-400"
  },
  {
    title: "การเรียกร้องค่าไถ่",
    description: "เข้ารหัสไฟล์สำคัญและเรียกเงินเพื่อแลกกับกุญแจถอดรหัส (Ransomware)",
    icon: DollarSign,
    color: "text-green-400"
  },
  {
    title: "เข้าถึงโดยไม่ได้รับอนุญาต",
    description: "แทรกซึมเข้าสู่เครือข่ายเพื่อควบคุมระบบ หรือเปลี่ยนแปลงข้อมูลภายใน",
    icon: Lock,
    color: "text-orange-400"
  }
];

export const ATTACK_TYPES: InfoCardData[] = [
  {
    title: "Phishing (ฟิชชิ่ง)",
    description: "หลอกลวงให้เหยื่อเปิดเผยข้อมูลส่วนตัวผ่านอีเมล/SMS ที่ดูน่าเชื่อถือ ในปี 2025 มีการใช้ AI สร้างข้อความที่แนบเนียนขึ้น รวมถึง Vishing (เสียง) และ Smishing (SMS)",
    icon: Mail,
    color: "text-yellow-400"
  },
  {
    title: "Malware (มัลแวร์)",
    description: "ซอฟต์แวร์ประสงค์ร้าย (Virus, Trojan, Spyware) แนวโน้มใหม่คือ Fileless Malware ที่ตรวจสอบยาก และ Polymorphic Malware ที่ปรับเปลี่ยนตัวเองได้",
    icon: Bug,
    color: "text-red-500"
  },
  {
    title: "Ransomware (แรนซัมแวร์)",
    description: "มัลแวร์เข้ารหัสไฟล์เพื่อเรียกค่าไถ่ แนวโน้มรุนแรงแบบ Double Extortion คือทั้งเข้ารหัสและขโมยข้อมูลไปขู่เผยแพร่",
    icon: FileWarning,
    color: "text-rose-500"
  },
  {
    title: "DDoS Attack",
    description: "ทำให้ระบบล่มด้วย Traffic มหาศาล ในปี 2025 พบการใช้ Botnet ขนาดใหญ่ขึ้นและการโจมตีผ่านอุปกรณ์ IoT",
    icon: ShieldAlert,
    color: "text-purple-500"
  },
  {
    title: "Vulnerability Exploitation",
    description: "การใช้ช่องโหว่ของระบบ (Exploits) โดยเฉพาะช่องโหว่ Zero-Day ที่ผู้ผลิตยังไม่ทราบหรือไม่ทันได้แก้ไข",
    icon: Unlock,
    color: "text-amber-500"
  },
  {
    title: "Social Engineering",
    description: "วิศวกรรมสังคม: การหลอกลวงทางจิตวิทยาให้เหยื่อตายใจ ปี 2025 เน้น Spear Phishing ที่ใช้ข้อมูลส่วนตัวเจาะจงเป้าหมาย",
    icon: Users,
    color: "text-blue-400"
  }
];

export const FUTURE_THREATS: InfoCardData[] = [
  {
    title: "AI & Deepfake",
    description: "การโจมตีมีความซับซ้อนมากขึ้น โดยใช้ AI สร้างภาพหรือเสียงปลอมเพื่อหลอกลวง (Deepfake)",
    icon: Cpu,
    color: "text-pink-500"
  },
  {
    title: "Fileless Malware",
    description: "เทคนิคการโจมตีแบบไร้ไฟล์ที่ทำงานในหน่วยความจำ ทำให้โปรแกรมแอนตี้ไวรัสทั่วไปตรวจจับยาก",
    icon: Ghost,
    color: "text-gray-400"
  }
];