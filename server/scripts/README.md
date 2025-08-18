# 🚀 **ONE Script to Rule Them All!**

## 📁 **Available Scripts**

- **`manual_leetscrape.py`** - **ONLY SCRIPT YOU NEED** ✅

## 🎯 **How to Use (Simple Steps)**

### **Step 1: Run the ONE Script**
```bash
# Navigate to the scripts directory
cd "C:\Users\ahaan\CODE\Coding Platform\server\scripts"

# Activate your virtual environment
C:\Users\ahaan\CODE\Coding Platform\server\venv311\Scripts\activate

# Run the script
python manual_leetscrape.py
```

### **Step 2: Follow the Prompts**
The script will:
1. ✅ Connect to your database
2. ✅ Create the `leetcode_suggestions` table if needed
3. 📝 Ask how many problems you want to fetch (default: 100)
4. 🔄 Fetch problems from LeetCode using leetscrape
5. 📊 Show progress every 10 problems
6. 💾 Insert problems into the database

### **Step 3: Use the Admin Panel**
After running the script:
1. Go to **Admin → Manage Problems**
2. Click **"+ Add More (LeetCode)"**
3. Browse and add problems from the suggestions list

## ⚙️ **Configuration (Optional)**

Edit `manual_leetscrape.py` to change:
- **Number of problems**: Change `max_problems=100` in the script
- **Progress frequency**: Change the progress update interval

## 🚨 **Troubleshooting**

- **Import error**: Make sure you're using the correct virtual environment
- **Database error**: Check that your database file exists and is accessible
- **Slow performance**: Reduce the number of problems to fetch

## 📊 **Expected Performance**

- **25 problems**: ~45 seconds
- **100 problems**: ~3 minutes
- **500 problems**: ~15 minutes

## 💡 **Tips**

- Start with a small number (25-50) to test
- Run during off-peak hours for better performance
- **This is the ONLY script you need!** 🎯
