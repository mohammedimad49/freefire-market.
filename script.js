import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6JrAc6pjWVhCWjB_sy__vCwKP8JVfVQ",
  authDomain: "freefire-market-e5467.firebaseapp.com",
  projectId: "freefire-market-e5467",
  storageBucket: "freefire-market-e5467.appspot.com",
  messagingSenderId: "709503936604",
  appId: "1:709503936604:web:0852572a3bba0b0c67566a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.requestBalance = async () => {
    const amount = document.getElementById('balanceAmount').value;
    const note = prompt("أدخل رقم العملية أو اسمك للتأكد من الدفع:");

    if(!amount || !note) return alert("يرجى إدخال المبلغ وتفاصيل الدفع!");

    alert("جاري إرسال طلبك...");
    
    try {
        // سيتم حفظ الطلب في Firestore مباشرة (الذي فعلته أنت بنجاح)
        await addDoc(collection(db, "orders"), {
            amount: amount,
            details: note,
            status: "pending",
            time: serverTimestamp()
        });

        alert("✅ تم إرسال طلبك! سيظهر عند المدير imad الآن.");
    } catch (e) {
        alert("تأكد من نشر القواعد في Firestore Database!");
    }
};
