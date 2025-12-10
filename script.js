document.addEventListener("DOMContentLoaded", function () {
    // Tạo đối tượng Audio
    const audioPlayer = new Audio();
    let currentProvince = null;
    
    // Mapping chính xác từ dataname sang tên file âm thanh
    const soundFileMap = {
        'tuyenquang': 'Tuyên Quang.wav',
        'laocai': 'Lào Cai.wav',
        'thainguyen': 'Thái Nguyên (2).wav',
        'phutho': 'Phú THọ (2).wav',
        'bacninh': 'Bắc Ninh (2).wav',
        'hungyen': 'Hưng Yên (2).wav',
        'haiphong': 'TP Hải Phòng (2).wav',
        'ninhbinh': 'Ninh Bình.wav',
        'quangtri': 'Quảng Trị.wav',
        'gialai': 'Gia Lai.wav',
        'khanhhoa': 'Khánh Hòa.wav',
        'lamdong': 'Lâm Đồng.wav',
        'daklak': 'Đắk Lắk.wav',
        'hochiminh': 'TP Hồ Chí Minh.wav',
        'dongnai': 'Đồng Nai.wav',
        'tayninh': 'Tây Ninh.wav',
        'cantho': 'TP Cần Thơ.wav',
        'vinhlong': 'Vĩnh Long.wav',
        'dongthap': 'Đồng Tháp.wav',
        'camau': 'Cà Mau.wav',
        'angiang': 'An Giang.wav',
        'dienbien': 'Điện Biên.wav',
        'caobang': 'Cao Bằng.wav',
        'laichau': 'Lai Châu.wav',
        'langson': 'Lạng Sơn.wav',
        'sonla': 'Sơn La.wav',
        'hanoi': 'hanoi.wav',
        'quangninh': 'Quảng Ninh.wav',
        'thanhhoa': 'Thanh Hóa.wav',
        'nghean': 'Nghệ An.wav',
        'hue': 'TP Huế.wav',
        'hatinh': 'Hà Tĩnh.wav'
    };

    // Tạo notification element
    const notification = document.createElement('div');
    notification.id = 'sound-notification';
    notification.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: #4CAF50; 
        color: white; 
        padding: 15px; 
        border-radius: 5px; 
        display: none; 
        z-index: 10000; 
        font-family: Arial, sans-serif; 
        font-size: 14px; 
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        max-width: 300px;
    `;
    document.body.appendChild(notification);

    const areas = document.querySelectorAll("#vietnam-map area");
    
    // Hàm hiển thị thông báo
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.style.background = isError ? '#f44336' : '#4CAF50';
        notification.style.display = 'block';
    }
    
    // Hàm ẩn thông báo
    function hideNotification() {
        notification.style.display = 'none';
    }
    
    // Thêm style cho các tỉnh khi hover
    const style = document.createElement('style');
    style.textContent = `
        area {
            cursor: pointer;
            outline: none;
        }
        area:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
    
    areas.forEach(area => {
        area.addEventListener("click", async function (e) {
            e.preventDefault();
            
            const name = this.getAttribute("dataname");
            const fileName = soundFileMap[name];
            
            if (!fileName) {
                showNotification(`Không tìm thấy âm thanh cho tỉnh: ${name}`, true);
                setTimeout(hideNotification, 3000);
                console.log(`Tỉnh "${name}" không có trong mapping.`);
                return;
            }
            
            // QUAN TRỌNG: Sử dụng đường dẫn TƯƠNG ĐỐI
            // Đảm bảo folder "34tinh" nằm CÙNG THƯ MỤC với file HTML
            const soundPath = `34tinh/${fileName}`;
            console.log('Đường dẫn âm thanh:', soundPath);
            
            // Dừng âm thanh hiện tại nếu đang phát cùng tỉnh
            if (currentProvince === name && !audioPlayer.paused) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                currentProvince = null;
                showNotification('Đã dừng âm thanh');
                setTimeout(hideNotification, 2000);
                return;
            }
            
            try {
                // Reset audio player
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                
                // Đặt nguồn âm thanh
                audioPlayer.src = soundPath;
                
                // Thêm preload
                audioPlayer.preload = 'auto';
                
                // Thử phát âm thanh
                const playPromise = audioPlayer.play();
                
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        currentProvince = name;
                        
                        // Hiển thị thông báo thành công
                        const displayName = fileName.replace('.wav', '').replace(' (2)', '');
                        showNotification(`Đang phát: ${displayName}`);
                        
                        // Tự động ẩn thông báo khi âm thanh kết thúc
                        audioPlayer.addEventListener('ended', function onEnded() {
                            hideNotification();
                            currentProvince = null;
                            audioPlayer.removeEventListener('ended', onEnded);
                        });
                        
                    }).catch(error => {
                        console.error('Lỗi khi phát âm thanh:', error);
                        handleAudioError(error, fileName);
                    });
                }
                
            } catch (error) {
                console.error('Lỗi không mong muốn:', error);
                handleAudioError(error, fileName);
            }
        });
        
        // Thêm tooltip
        area.title = `Click để nghe âm thanh ${area.getAttribute('dataname')}`;
    });
    
    // Hàm xử lý lỗi âm thanh
    function handleAudioError(error, fileName) {
        let errorMessage = 'Không thể phát âm thanh. ';
        
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Trình duyệt chặn phát âm thanh tự động. ';
            errorMessage += 'Vui lòng click vào trang web trước.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += `Không tìm thấy file: ${fileName}. `;
            errorMessage += 'Kiểm tra xem file có trong folder 34tinh không.';
        } else {
            errorMessage += 'Vui lòng kiểm tra cấu trúc thư mục. ';
            errorMessage += 'Folder "34tinh" phải cùng thư mục với file HTML.';
        }
        
        showNotification(errorMessage, true);
        setTimeout(hideNotification, 5000);
    }
    
    // Hiển thị thông báo chào mừng
    showNotification('Bản đồ đã sẵn sàng. Click vào tỉnh để nghe âm thanh!');
    setTimeout(hideNotification, 5000);
    
    // Thêm nút điều khiển
    const controls = document.createElement('div');
    controls.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 12px;
    `;
    controls.innerHTML = `
        <div style="margin-bottom: 5px;">Điều khiển âm thanh:</div>
        <button id="stopBtn" style="margin-right: 5px; padding: 5px 10px;">Dừng</button>
        <button id="testBtn" style="padding: 5px 10px;">Test</button>
    `;
    document.body.appendChild(controls);
    
    // Xử lý nút dừng
    document.getElementById('stopBtn').addEventListener('click', function() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        currentProvince = null;
        showNotification('Đã dừng âm thanh');
        setTimeout(hideNotification, 2000);
    });
    
    // Xử lý nút test
    document.getElementById('testBtn').addEventListener('click', function() {
        // Test với file An Giang.wav
        const testPath = '34tinh/An Giang.wav';
        audioPlayer.src = testPath;
        audioPlayer.play().then(() => {
            showNotification('Test thành công: Đang phát âm thanh test');
            setTimeout(hideNotification, 3000);
        }).catch(error => {
            showNotification('Test thất bại. Kiểm tra cấu trúc thư mục.', true);
            setTimeout(hideNotification, 3000);
        });
    });
});