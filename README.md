
# Eihtikar | احتكار

**A Modern Arabic Multiplayer Board Game | لعبة لوحية عربية جماعية حديثة**

---

## English

### Overview
Eihtikar is a digital board game inspired by Monopoly, designed for Arabic-speaking players with full right-to-left (RTL) support and a modern, accessible interface. The game features real-time multiplayer, chat, and a rich set of property and chance cards, all localized in both Arabic and English.

### Features
- Real-time online multiplayer board game
- Arabic-first, RTL layout and UI
- Modern, responsive design using React, TypeScript, and Tailwind CSS
- In-game chat, dice, trading, and property management
- Server-client architecture with shared game logic

### Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend:** Node.js (TypeScript), custom Express-like server, Drizzle ORM
- **Build Tools:** Vite, tsx, PostCSS
- **Other:** Shared code between client/server, modular aliases, runtime error overlays, Drizzle for DB migrations

### Deploying on Render.com

You can easily deploy Eihtikar on [Render.com](https://render.com) for both the frontend and backend. Follow these steps:

#### 1. Upload to GitHub
Push your project to a GitHub repository if it’s not already there.

#### 2. Backend (Web Service)
- On Render.com, create a new **Web Service**.
- Connect your GitHub repo and select the project.
- Set the root directory to `/server` if needed.
- **Build command:**
	```bash
	npm install && npm run build
	```
- **Start command:**
	```bash
	npm run start
	```
- Set the environment to **Node** and ensure the port matches your server config (default: 3000 or as in your code).

#### 3. Frontend (Static Site)
- Create a new **Static Site** on Render.
- Set the root directory to `/client`.
- **Build command:**
	```bash
	npm install && npm run build
	```
- **Publish directory:** `dist`

#### 4. Environment Variables

#### Backend Environment Variables
Environment variables are used to configure your backend service without hardcoding sensitive or environment-specific data. On Render.com, you can set these variables in the "Environment" section of your backend Web Service settings. Common examples:

- `DATABASE_URL` – The connection string for your PostgreSQL or other database.
- `SESSION_SECRET` – A secret key for session encryption.
- `PORT` – The port your server listens on (Render sets this automatically, but you can reference it in your code).
- `NODE_ENV` – Set to `production` or `development`.

**How to use:**
In your backend code, access variables using `process.env.VARIABLE_NAME`.
```js
const dbUrl = process.env.DATABASE_URL;
```

**How to set:**
- Go to your backend service on Render.com
- Open the Environment tab
- Add each variable name and value

Never commit secrets or credentials to your codebase—always use environment variables.

#### 5. Database (Optional)

#### Database (Is it required?)
Eihtikar supports integration with a database (PostgreSQL) using Drizzle ORM. **Using a database is optional:**

- If you want to enable features like persistent player data, statistics, or advanced session management, you must set up a PostgreSQL database and add the `DATABASE_URL` environment variable in your backend settings on Render.com.
- For basic gameplay and testing, the project can run without a database, but some features may be limited or unavailable.

**How to enable database support:**
1. Create a managed PostgreSQL instance on Render.com (or any cloud provider).
2. Copy the database connection string.
3. Add it as `DATABASE_URL` in your backend's environment variables on Render.com.

**Summary:**
- Database is **not required** for basic use, but **required** for full features.

#### 6. Connect Frontend to Backend

#### 7. Connecting Frontend to Backend using Environment Variables
To make the frontend communicate with the backend on Render.com, follow these steps:

1. **Set an environment variable in Render for the frontend site:**
	 - Go to your frontend Static Site settings on Render.com.
	 - Add a new environment variable, for example:
		 - `VITE_API_URL=https://your-backend-service.onrender.com`
	 - Replace the value with your actual backend Render URL.

2. **Use the environment variable in your frontend code:**
	 - In your frontend code, access the variable using `import.meta.env.VITE_API_URL` (for Vite projects).
	 - Example usage:
		 ```js
		 const apiUrl = import.meta.env.VITE_API_URL;
		 fetch(`${apiUrl}/api/endpoint`)
		 ```

3. **Deploy or redeploy your frontend site** after setting the variable.

This ensures your frontend always points to the correct backend URL, even if it changes.

### Local Development
1. **Install dependencies:**
	 ```bash
	 npm install
	 ```
2. **Run the development server:**
	 ```bash
	 npm run dev
	 ```
3. **Build for production:**
	 ```bash
	 npm run build
	 ```

---

## العربية

### نظرة عامة
احتكار هي لعبة لوحية رقمية مستوحاة من مونوبولي، مصممة للاعبين الناطقين بالعربية مع دعم كامل للواجهة من اليمين لليسار وتصميم عصري وسهل الاستخدام. توفر اللعبة تجربة جماعية في الوقت الحقيقي، ودردشة داخلية، ومجموعة غنية من البطاقات العقارية وبطاقات الفرص والمجتمع، مع تعريب كامل باللغتين العربية والإنجليزية.

### الميزات
- لعبة لوحية جماعية عبر الإنترنت في الوقت الحقيقي
- واجهة عربية أولاً ودعم كامل للاتجاه من اليمين لليسار
- تصميم عصري متجاوب باستخدام React وTypeScript وTailwind CSS
- دردشة داخلية، نرد، تداول، وإدارة العقارات
- بنية خادم-عميل مع منطق لعبة مشترك

### التقنيات المستخدمة
- **الواجهة الأمامية:** React، TypeScript، Vite، Tailwind CSS، مكونات Radix UI
- **الواجهة الخلفية:** Node.js (TypeScript)، خادم مشابه لـ Express، Drizzle ORM
- **أدوات البناء:** Vite، tsx، PostCSS
- **أخرى:** كود مشترك بين العميل والخادم، أسماء مستعارة معيارية، طبقات عرض أخطاء وقت التشغيل، Drizzle لترحيل قواعد البيانات

### النشر على Render.com

يمكنك نشر مشروع احتكار بسهولة على [Render.com](https://render.com) للواجهة الأمامية والخلفية. اتبع الخطوات التالية:

#### ١. رفع المشروع على GitHub
ارفع المشروع إلى مستودع GitHub إذا لم يكن موجودًا بالفعل.

#### ٢. إنشاء خدمة ويب للخادم (Backend)
- في Render.com أنشئ **Web Service** جديد.
- اربط المستودع واختر المشروع.
- اجعل مجلد الجذر `/server` إذا لزم الأمر.
- **أمر البناء:**
	```bash
	npm install && npm run build
	```
- **أمر التشغيل:**
	```bash
	npm run start
	```
- اختر بيئة Node وتأكد من رقم المنفذ (عادة 3000 أو حسب إعدادك).

#### ٣. إنشاء موقع ثابت للواجهة الأمامية (Frontend)
- أنشئ **Static Site** جديد في Render.
- اجعل مجلد الجذر `/client`.
- **أمر البناء:**
	```bash
	npm install && npm run build
	```
- **مجلد النشر:** `dist`

#### ٤. المتغيرات البيئية

#### المتغيرات البيئية في الواجهة الخلفية (Backend)
المتغيرات البيئية هي وسيلة لضبط إعدادات الخادم دون كتابة بيانات حساسة أو متغيرة في الكود. في Render.com يمكنك إضافة هذه المتغيرات من إعدادات خدمة Web Service الخاصة بالخادم.

أمثلة شائعة:
- `DATABASE_URL` – رابط الاتصال بقاعدة البيانات (PostgreSQL أو غيرها)
- `SESSION_SECRET` – كلمة سرية لتشفير الجلسات
- `PORT` – رقم المنفذ الذي يستمع عليه الخادم (Render يضبطه تلقائيًا ويمكنك استخدامه في الكود)
- `NODE_ENV` – تحدد بيئة التشغيل (production أو development)

**الاستخدام في الكود:**
```js
const dbUrl = process.env.DATABASE_URL;
```

**طريقة الإضافة:**
- انتقل إلى خدمة الخادم في Render.com
- افتح تبويب Environment
- أضف اسم المتغير وقيمته

لا تضع أي بيانات سرية أو كلمات مرور داخل الكود مباشرة، بل استخدم المتغيرات البيئية دائمًا.

#### ٥. قاعدة البيانات (اختياري)

#### قاعدة البيانات (هل هي مطلوبة؟)
مشروع احتكار يدعم التكامل مع قاعدة بيانات (PostgreSQL) باستخدام Drizzle ORM. **استخدام قاعدة البيانات اختياري:**

- إذا كنت تريد تفعيل ميزات مثل حفظ بيانات اللاعبين بشكل دائم، الإحصائيات، أو إدارة الجلسات المتقدمة، يجب عليك إعداد قاعدة بيانات PostgreSQL وإضافة متغير البيئة `DATABASE_URL` في إعدادات الخادم على Render.com.
- للتجربة أو اللعب الأساسي، يمكن تشغيل المشروع بدون قاعدة بيانات، لكن بعض الميزات ستكون محدودة أو غير متاحة.

**كيفية تفعيل دعم قاعدة البيانات:**
1. أنشئ قاعدة بيانات PostgreSQL مُدارة على Render.com (أو أي مزود سحابي آخر).
2. انسخ رابط الاتصال بقاعدة البيانات.
3. أضف الرابط كمتغير بيئي باسم `DATABASE_URL` في إعدادات الخادم على Render.com.

**الخلاصة:**
- قاعدة البيانات **ليست مطلوبة** للتشغيل الأساسي، لكنها **مطلوبة** للحصول على جميع الميزات الكاملة.

#### ٦. ربط الواجهة الأمامية بالخلفية

#### ٧. ربط الواجهة الأمامية بالخلفية عبر المتغيرات البيئية
لجعل الواجهة الأمامية تتواصل مع الخادم على Render.com، اتبع الخطوات التالية:

1. **أضف متغير بيئي في إعدادات موقع الواجهة الأمامية في Render:**
	 - انتقل إلى إعدادات Static Site الخاصة بالواجهة الأمامية في Render.com.
	 - أضف متغير بيئي جديد، مثلاً:
		 - `VITE_API_URL=https://your-backend-service.onrender.com`
	 - استبدل القيمة برابط الخادم الفعلي الخاص بك على Render.

2. **استخدم المتغير البيئي في كود الواجهة الأمامية:**
	 - في كود الواجهة الأمامية، استخدم المتغير عبر `import.meta.env.VITE_API_URL` (لمشاريع Vite).
	 - مثال:
		 ```js
		 const apiUrl = import.meta.env.VITE_API_URL;
		 fetch(`${apiUrl}/api/endpoint`)
		 ```

3. **قم بنشر أو إعادة نشر موقع الواجهة الأمامية** بعد إضافة المتغير.

بهذا تضمن أن الواجهة الأمامية تشير دائمًا إلى رابط الخادم الصحيح حتى لو تغير لاحقًا.

### التشغيل محليًا
1. **تثبيت الحزم:**
	 ```bash
	 npm install
	 ```
2. **تشغيل الخادم في وضع التطوير:**
	 ```bash
	 npm run dev
	 ```
3. **البناء للإنتاج:**
	 ```bash
	 npm run build
	 ```

---

# تشغيل المشروع على Render.com

يمكنك نشر مشروع احتكار بسهولة على [Render.com](https://render.com) للواجهة الأمامية والخلفية. اتبع الخطوات التالية:

## ١. رفع المشروع على GitHub
ارفع المشروع إلى مستودع GitHub إذا لم يكن موجودًا بالفعل.

## ٢. إنشاء خدمة ويب للخادم (Backend)
- في Render.com أنشئ **Web Service** جديد.
- اربط المستودع واختر المشروع.
- اجعل مجلد الجذر `/server` إذا لزم الأمر.
- أمر البناء:
	```bash
	npm install && npm run build
	```
- أمر التشغيل:
	```bash
	npm run start
	```
- اختر بيئة Node وتأكد من رقم المنفذ (عادة 3000 أو حسب إعدادك).

## ٣. إنشاء موقع ثابت للواجهة الأمامية (Frontend)
- أنشئ **Static Site** جديد في Render.
- اجعل مجلد الجذر `/client`.
- أمر البناء:
	```bash
	npm install && npm run build
	```
- مجلد النشر: `dist`

## ٤. المتغيرات البيئية
أضف أي متغيرات بيئية مطلوبة من لوحة تحكم Render (مثل روابط قواعد البيانات أو عناوين API).

## ٥. قاعدة البيانات (اختياري)
إذا كنت تستخدم Drizzle ORM مع قاعدة بيانات، أنشئ قاعدة بيانات PostgreSQL من Render وضع الرابط في المتغيرات البيئية.

## ٦. ربط الواجهة الأمامية بالخلفية
حدث روابط API في الواجهة الأمامية لتشير إلى رابط الخادم على Render.

