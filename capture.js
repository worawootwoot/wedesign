$(document).ready(function () {
    function imgpopup(imageUrl) {
        Swal.fire({
            title: '<strong>ภาพตัวอย่าง</strong>',
            html: `<img src="${imageUrl}" alt="Image" style="max-width: none; width: auto; border-radius: 10px;"/>`,
            background: '#f7f9fc',
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonColor: '#007bff',
            confirmButtonText: 'ปิดหน้าต่าง',
            customClass: {
                popup: 'custom-swal-popup'
            }
        });
    }

    let $canvas = $('.capture-canvas');
    let canvas = $canvas[0];
    let ctx = canvas.getContext('2d');
    let $selection = $('.selectioncheck');
    let isSelecting = false, startX, startY;
    ctx.imageSmoothingEnabled = false;
    async function captureScreen() {
        try {
            $canvas.show();
            $selection.hide();
            $('.workimagePreview').html('');
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 3840 },
                    height: { ideal: 2160 }
                }
            });
            let video = $('.screen-video')[0];
            video.srcObject = stream;
            video.onloadedmetadata = function () {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                setTimeout(function () {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    stream.getTracks().forEach(track => track.stop());
                }, 1000);
            };
        } catch (err) {
            $canvas.hide()
            console.error(err);
        }
    }

    $('.capture-btn').on('click', captureScreen);
    function getClientCoords(e) {
        return e.originalEvent.touches
            ? { x: e.originalEvent.touches[0].clientX, y: e.originalEvent.touches[0].clientY }
            : { x: e.clientX, y: e.clientY };
    }

    function startSelection(e) {
        let coords = getClientCoords(e);
        let rect = $canvas[0].getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        isSelecting = true;
        startX = (coords.x - rect.left) * scaleX;
        startY = (coords.y - rect.top) * scaleY;
        $selection.css({
            left: (coords.x - rect.left) + 'px',
            top: (coords.y - rect.top) + 'px',
            width: '0',
            height: '0',
            display: 'block'
        });
    }

    function moveSelection(e) {
        if (!isSelecting) return;
        let coords = getClientCoords(e);
        let rect = $canvas[0].getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        let currentX = (coords.x - rect.left) * scaleX;
        let currentY = (coords.y - rect.top) * scaleY;
        let dispStartX = startX / scaleX;
        let dispStartY = startY / scaleY;
        let dispCurrentX = coords.x - rect.left;
        let dispCurrentY = coords.y - rect.top;
        let left = Math.min(dispStartX, dispCurrentX);
        let top = Math.min(dispStartY, dispCurrentY);
        let width = Math.abs(dispCurrentX - dispStartX);
        let height = Math.abs(dispCurrentY - dispStartY);
        $selection.css({
            left: left + 'px',
            top: top + 'px',
            width: width + 'px',
            height: height + 'px',
            display: 'block'
        });
    }

    function endSelection(e) {
        isSelecting = false;
        let selRect = $selection[0].getBoundingClientRect();
        if (selRect.width > 10 && selRect.height > 10) {
            cropAndPrompt();
        } else {
            $selection.hide();
            $canvas.hide();
        }
    }
    $canvas.on('mousedown touchstart', function (e) {
        e.preventDefault();
        startSelection(e);
    });
    $canvas.on('mousemove touchmove', function (e) {
        e.preventDefault();
        moveSelection(e);
    });
    $canvas.on('mouseup mouseleave touchend', function (e) {
        e.preventDefault();
        endSelection(e);
    });
    function dataURItoBlob(dataURI) {
        let byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = decodeURI(dataURI.split(',')[1]);
        }
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    function cropAndPrompt() {
        let rect = $canvas[0].getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        let selRect = $selection[0].getBoundingClientRect();
        let cropX = (selRect.left - rect.left) * scaleX;
        let cropY = (selRect.top - rect.top) * scaleY;
        let cropW = selRect.width * scaleX;
        let cropH = selRect.height * scaleY;
        if (cropW && cropH) {
            let croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = cropW;
            croppedCanvas.height = cropH;
            let croppedCtx = croppedCanvas.getContext('2d');
            croppedCtx.imageSmoothingEnabled = false;
            croppedCtx.putImageData(ctx.getImageData(cropX, cropY, cropW, cropH), 0, 0);
            let croppedDataUrl = croppedCanvas.toDataURL("image/png");

            Swal.fire({
                title: 'ใช้ภาพที่ครอปนี้หรือไม่?',
                text: 'โปรดตรวจสอบภาพตัวอย่างด้านล่าง',
                imageUrl: croppedDataUrl,
                imageAlt: 'Cropped image preview',
                showCancelButton: true,
                confirmButtonText: 'ใช่',
                cancelButtonText: 'ไม่ใช่'
            }).then(function (result) {
                if (result.isConfirmed) {
                    $canvas.hide();
                    let blob = dataURItoBlob(croppedDataUrl);
                    let file = new File([blob], "cropped-image.png", { type: "image/png" });
                    let dt = new DataTransfer();
                    dt.items.add(file);
                    $('#workimage')[0].files = dt.files;
                    let $previewImg = $('<img>', {
                        src: croppedDataUrl,
                        class: 'img-fluid rounded',
                        alt: 'Cropped Image',
                        css: { cursor: 'pointer' }
                    });
                    $previewImg.on('click', function () {
                        imgpopup(croppedDataUrl);
                    });
                    $('.workimagePreview').html($previewImg);
                }
            });
        }
        $selection.hide();
    }
});