const uuid = crypto.randomUUID();
let pageOptions = [6, 25, 50, 100, 'All']
let currentPage = 1;
let totalPages = 6;
$(document).ready(function () {
    $('.spinner-border,.updatework').hide()
    if (localStorage.getItem('values')) {
        showhidepage('.newwork,nav')
        showhidepage2('nav')
        getdata()
    } else {
        showhidepage('.login')
        localStorage.clear()
    }

    $('.logout').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearLocalStorageExceptDarkMode();
        $('.idwork').data('uploaded', '');
        showhidepage('.login');
        localStorage.clear()
    });

    function clearLocalStorageExceptDarkMode() {
        let darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            localStorage.setItem('darkMode', 'false');
            $('#darkModeIcon').trigger('click');
        }
    }

    $(document).on('input', 'input[id^="qorder"]', function () {
        let total = 0;
        $('input[id^="qorder"]').each(function () {
            let num = parseFloat($(this).val());
            if (!isNaN(num)) {
                total += num;
            }
        });
        $('#workneedleall').val(total);
    });

    $('.logins').click(async function (e) {
        e.preventDefault();
        e.stopPropagation();
        let idform = "login-form"
        let itemData = await getFormData(idform);
        if (!checkvalue(itemData, [])) {
        } else {
            setstatuslogin(itemData)
        }
    })

    $('#dateendtwork').on('change', function () {
        let endDate = $(this).val();
        let startDate = $('#datestartwork').val();

        if (endDate && !startDate) {
            Swal.fire('เลือกวันที่เริ่มต้นก่อน', '', 'error');
            $(this).val("");
            return;
        }

        if (startDate && endDate && endDate < startDate) {
            Swal.fire('วันที่สิ้นสุดไม่สามารถน้อยกว่าวันที่เริ่มต้นได้', '', 'error');
            $(this).val("");
            return;
        }

        updateChart();
    });

    $('#dateendtwork2').on('change', function () {
        let endDate = $(this).val();
        let startDate = $('#datestartwork2').val();

        if (endDate && !startDate) {
            Swal.fire('เลือกวันที่เริ่มต้นก่อน', '', 'error');
            $(this).val("");
            return;
        }

        if (startDate && endDate && endDate < startDate) {
            Swal.fire('วันที่สิ้นสุดไม่สามารถน้อยกว่าวันที่เริ่มต้นได้', '', 'error');
            $(this).val("");
            return;
        }

        updateChart2();
    });


    $('#monthwork').on('change', function () {
        updateChart3();
    });

    $('#dateendtwork4').on('change', function () {
        let endDate = $(this).val();
        let startDate = $('#datestartwork4').val();

        if (endDate && !startDate) {
            Swal.fire('เลือกวันที่เริ่มต้นก่อน', '', 'error');
            $(this).val("");
            return;
        }

        if (startDate && endDate && endDate < startDate) {
            Swal.fire('วันที่สิ้นสุดไม่สามารถน้อยกว่าวันที่เริ่มต้นได้', '', 'error');
            $(this).val("");
            return;
        }

        updateChart4();
    });

    $('#dateendtwork5').on('change', function () {
        let endDate = $(this).val();
        let startDate = $('#datestartwork5').val();

        if (endDate && !startDate) {
            Swal.fire('เลือกวันที่เริ่มต้นก่อน', '', 'error');
            $(this).val("");
            return;
        }

        if (startDate && endDate && endDate < startDate) {
            Swal.fire('วันที่สิ้นสุดไม่สามารถน้อยกว่าวันที่เริ่มต้นได้', '', 'error');
            $(this).val("");
            return;
        }

        updateChart5();
    });


});

let rowform = 0
let rownewform = 0

let worklist = localStorage.getItem('worklist');
let worklistall = worklist ? JSON.parse(worklist) : [];

let shiftlist = localStorage.getItem('shift');
let shift = shiftlist ? JSON.parse(shiftlist) : [];

let workmoneye = localStorage.getItem('workmoney');
let workmoneys = workmoneye ? JSON.parse(workmoneye) : [];

let workmoneyesum = localStorage.getItem('workmoneysum');
let workmoneyssums = workmoneyesum ? JSON.parse(workmoneyesum) : [];

let machinesume = localStorage.getItem('machinesums');
let machinesum = machinesume ? JSON.parse(machinesume) : [];

function getdata() {
    setprofile()
    updateChart();
    updateChart2();
    updateChart3();
    updateChart4();
    updateChart5();
    machinelist()
    createlist('#listSelect', pageOptions)
    createlist('#listSelectbill', pageOptions)
    machineslist()
    worklists()
    workshift()
    workmoney()
    workmoneysum()
    machinesums()
}

let $myChart = $('#myChart');
let ctx = $myChart[0].getContext('2d');
let myChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString('en-US');
                    }
                }
            }
        }
    }
});

function updateChart() {
    let startDate = $('#datestartwork').val();
    let endDate = $('#dateendtwork').val();
    let summary = {};

    machinesum.forEach(ms => {
        let parts = ms[0].split('T');
        let datePart = parts[0];
        let timePart = parts[1];
        let dateParts = datePart.split('-');
        let adYear = parseInt(dateParts[0]) - 543;
        let fullTimestamp = `${adYear}-${dateParts[1]}-${dateParts[2]}T${timePart}`;
        let dateObj = new Date(fullTimestamp);

        if (dateObj.getHours() < 8) {
            dateObj.setDate(dateObj.getDate() - 1);
        }

        let hour = dateObj.getHours();
        let shift = (hour >= 8 && hour < 20) ? 'day' : 'night';

        let formattedDate =
            dateObj.getFullYear() + '-' +
            ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' +
            ('0' + dateObj.getDate()).slice(-2);

        if (startDate && endDate) {
            let startDateObj = new Date(startDate);
            let endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999);
            if (dateObj < startDateObj || dateObj > endDateObj) {
                return;
            }
        }

        let quantity = ms[2];
        let code = ms[3];

        let workRecord = worklistall.find(w => w[1] === code);
        if (workRecord) {
            let multiplier = workRecord[7];
            let calculatedValue = quantity * multiplier;
            let key = `${formattedDate}_${shift}`;
            summary[key] = (summary[key] || 0) + calculatedValue;
        }
    });

    let tableData = [];
    for (let key in summary) {
        let parts = key.split('_');
        let date = parts[0];
        let shift = parts[1];
        tableData.push({ date, shift, total: summary[key] });
    }

    let tbody = document.querySelector('.shiftTable tbody');
    tbody.innerHTML = '';
    tableData.forEach(row => {
        let shiftLabel = row.shift === 'day' ? 'เช้า' : 'ดึก';
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.date}</td>
                        <td>${shiftLabel}</td>
                        <td>${row.total.toLocaleString('en-US')}</td>`;
        tbody.appendChild(tr);
    });

    let dateShiftData = {};
    tableData.forEach(item => {
        if (!dateShiftData[item.date]) {
            dateShiftData[item.date] = {};
        }
        let shiftKey = item.shift;
        dateShiftData[item.date][shiftKey] = item.total;
    });

    let dates = Object.keys(dateShiftData).sort();
    let shiftSet = new Set();
    tableData.forEach(item => {
        shiftSet.add(item.shift);
    });
    let shiftArr = Array.from(shiftSet);
    shiftArr.sort((a, b) => {
        if (a === b) return 0;
        if (a === 'day') return -1;
        if (a === 'night') return 1;
        return 0;
    });

    let colors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)'
    ];
    let borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)'
    ];

    let datasets = shiftArr.map((shift, index) => {
        let shiftLabel = shift === 'day' ? 'เช้า' : 'ดึก';
        let data = dates.map(date => dateShiftData[date][shift] || 0);
        return {
            label: shiftLabel,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderColor: borderColors[index % borderColors.length],
            borderWidth: 1
        };
    });

    myChart.data.labels = dates;
    myChart.data.datasets = datasets;
    myChart.update();

    let dayTotal = 0, nightTotal = 0;
    tableData.forEach(row => {
        if (row.shift === 'day') {
            dayTotal += row.total;
        } else if (row.shift === 'night') {
            nightTotal += row.total;
        }
    });

    $('#mowork').val(dayTotal.toLocaleString('en-US'));
    $('#niwork').val(nightTotal.toLocaleString('en-US'));
}

function setprofile() {
    let name = localStorage.getItem('name')
    let profile = localStorage.getItem('profile') || 'https://cdn.glitch.global/7b9923d0-b70a-46e7-90b0-02ad57af7703/logo1.jpg?v=1710403780404'
    let values = localStorage.getItem('values')
    if (values !== 'admin') {
        $('.admins').hide()
    }
    $('#profile').attr('src', profile);
    $('#profilename').text(name)
    $('#profileposition').text(values)
}

$('.saveaddmenus').click(async function (e) {
    e.preventDefault();
    e.stopPropagation();
    let time = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
    $('#ework').val(time);
    let status = $(this).data('status');
    let idform = "newwork";
    let itemData = await getFormData(idform);

    let aworkIds = [];
    $('input[id^="awork"]').each(function () {
        aworkIds.push($(this).attr('id'));
    });
  
    let qorderIds = [];
    $('input[id^="qorder"]').each(function () {
        qorderIds.push($(this).attr('id'));
    });
    
    let allIds = aworkIds.concat(qorderIds);

    if (!checkvalue(itemData, allIds)) {
    } else {
        saveroundwork(itemData, status);
    }
});

$('.saveworkstone').click(async function (e) {
    e.preventDefault();
    e.stopPropagation();
    let idform = "addworkstone"
    let itemData = await getFormData(idform);
    if (!checkvalue(itemData, [])) {
    } else {
        saveworkstone(itemData)
    }
})

$('.workfail').click(function (e) {
    e.preventDefault();
    Swal.fire({
        title: 'แจ้งงานเสีย',
        html: `
            <div class="form-group">
                <label for="swal-input-file">แนบรูปภาพ</label>
                <input type="file" id="swal-input-file" class="form-control" accept="image/*" capture="camera">
            </div>
            <div class="form-group mt-3">
                <label for="swal-input-quantity">ระบุจำนวน</label>
                <input type="number" id="swal-input-quantity" class="form-control" placeholder="ระบุจำนวน">
            </div>
        `,
        showCancelButton: true,
        cancelButtonText: 'ยกเลิก',
        allowOutsideClick: true,
        allowEscapeKey: true,
        confirmButtonText: 'อัปโหลด',
        preConfirm: () => {
            const file = document.getElementById('swal-input-file').files[0];
            const quantity = document.getElementById('swal-input-quantity').value;
            if (!file) {
                Swal.showValidationMessage('กรุณาถ่ายภาพหรือเลือกไฟล์ภาพ');
                return false;
            }
            if (!quantity) {
                Swal.showValidationMessage('กรุณาระบุจำนวน');
                return false;
            }
            return { file, quantity };
        }
    }).then(async (result) => {
        if (result.isConfirmed && result.value) {
            const { file, quantity } = result.value;
            const clientId = '4441ae32883b4db0accbba6a28819795';
            try {
                const link = await uploadToImgbb(file, clientId);
                let setstatus = {
                    opt: 'workfail',
                    img: link,
                    quantity: quantity,
                    idcheck: $('.idwork').val()
                };
                fetch(scriptUrl, {
                    method: "POST",
                    body: new URLSearchParams(setstatus),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                    .then(response => response.json())
                    .then(res => {
                        if (res.status === 'success') {
                        } else if (res.status === "error") {
                            Swal.fire({
                                icon: 'error',
                                title: res.message,
                                allowOutsideClick: false,
                                confirmButtonText: 'ตกลง',
                            });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        Swal.fire({
                            icon: 'error',
                            title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                            allowOutsideClick: false,
                            confirmButtonText: 'ตกลง',
                        });
                    });
            } catch (error) {
                console.error('เกิดข้อผิดพลาด', error);
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอัปโหลดได้', 'error');
            }
        }
    });
});

$('.savebill').click(async function (e) {
    e.preventDefault();
    e.stopPropagation();
    let idform = "editbill"
    let itemData = await getFormData(idform);
    let savebills = [];
    $('input[id^="note"]').each(function () {
        savebills.push($(this).attr('id'));
    });
    if (!checkvalue(itemData, savebills)) {
    } else {
        let billids = {};
        $('p[id^="id"]').each(function () {
            let key = $(this).attr("id");
            $.each(this.attributes, function () {
                if (this.name.startsWith("data-ids")) {
                    billids[key] = this.value;
                }
            });
        });
        savebill(itemData, billids)
    }
})

$('.addnwork').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
  rownewform = 0
    let uuid = crypto.randomUUID();
    showhidepage('.editwork,nav')
    $('.status').text('เพิ่มงานใหม่')
    $('.status').data('uuid', uuid);
    clearForm('editwork');
    $('.updatework').hide()
    let container = $(".worknewlist");
    container.empty();
});

function setstatuslogin(itemData) {
    showhidepage('header');
    let setstatus = {
        opt: 'loginform',
        ...itemData
    };
    fetch(scriptUrl, {
        method: "POST",
        body: new URLSearchParams(setstatus),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                Swal.fire({
                    title: res.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    showhidepage('.newwork,nav')
                    localStorage.setItem('profile', res.profile)
                    localStorage.setItem('name', res.name)
                    localStorage.setItem('values', res.values)
                    setprofile()
                    getdata()
                });
            } else if (res.status === "error") {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    showhidepage('.login')
                    localStorage.clesr()
                });
            }
        })
        .catch(err => {
            showhidepage('.login')
            localStorage.clesr()
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                allowOutsideClick: false,
                confirmButtonText: 'ตกลง',
            });
        });
}

$(document).on("click", '.navigate-button', function (e) {
    e.preventDefault()
    e.stopPropagation();
    let target = $(this).data('target') + ', nav'
    showhidepage(target)
    showhidepage2(target)
    getdata()
    removeinvalid()
})

$('.imagepreview').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    let imageUrl = $(this).attr('src');
    openImagePopup(imageUrl)
});

$('.checkin').click(function (e) {
    e.preventDefault();
    e.stopPropagation();

    let uuids = crypto.randomUUID();

    $(this).hide();
    $('.spinner-border').show();

    let machinetype = $('#machinetype').val();
    let idwork = $('.idwork').data('idwork');
    if (!machinetype) {
        Swal.fire('เลือกเครื่องทำงานก่อน', '', 'error');
        $(this).show();
        $('.spinner-border').hide();
        return;
    }
    let setstatus = {
        opt: 'setmachine',
        machine: machinetype,
        work: idwork,
    };
    fetch(scriptUrl, {
        method: "POST",
        body: new URLSearchParams(setstatus),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
        .then(response => response.json())
        .then(res => {
            $('.spinner-border').hide();
            if (res.status === 'success') {
                $(this).hide();
                let time = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
                $('#swork').val(time);
                $('#uuid').text(uuids);
                showhidepage('.newwork,nav');
                showhidepage2('.worklist,.wtype,.wmachine,.wset,nav');
                localStorage.setItem('timestart', time)
            } else if (res.status === "error") {
                $(this).show();
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    showhidepage('.newwork,nav');
                });
            }
        })
        .catch(err => {
            $(this).show();
            $('.spinner-border').hide();
            showhidepage('.newwork,nav');
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                allowOutsideClick: false,
                confirmButtonText: 'ตกลง',
            });
        });
});

function machinelist() {
    let ket = "machinelist";
    let val = "data1";
    let keyset = ""
    let extraValue = "";
    return getdatatable(ket, val, keyset, (updatedData) => {
        machinelists(updatedData)
    }, false, extraValue)
        .then(value => {
            machinelists(value)
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function machineslist() {
    let ket = "machineslist";
    let val = "data2";
    let keyset = ""
    let extraValue = "";
    return getdatatable(ket, val, keyset, (updatedData) => {
        setselect(updatedData)
    }, false, extraValue)
        .then(value => {
            setselect(value)
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function worklists() {
    let ket = "worklist";
    let val = "data3";
    let keyset = ""
    let extraValue = "";
    return getdatatable(ket, val, keyset, (updatedData) => {
        worklistall = updatedData;
        let listworks = updatedData.filter(row => { return row[1] !== null && row[1] !== '' && row[10] === '' }).map(row => row[1]);
        autocomplete("#idwork", listworks);
        listwork(updatedData)
        listbill(updatedData)
    }, false, extraValue)
        .then(value => {
            worklistall = value;
            let listworks = value.filter(row => { return row[1] !== null && row[1] !== '' && row[10] === '' }).map(row => row[1]);
            autocomplete("#idwork", listworks);
            listwork(value)
            listbill(value)
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function workshift() {
    let ket = "shift";
    let val = "data4";
    let keyset = ""
    let extraValue = "";
    return getdatatable(ket, val, keyset, (updatedData) => {
        shift = updatedData;
    }, false, extraValue)
        .then(value => {
            shift = value;
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function workmoney() {
    let ket = "workmoney";
    let val = "data5";
    let keyset = ""
    let extraValue = "";
    return getdatatable(ket, val, keyset, (updatedData) => {
        workmoneys = updatedData;
    }, false, extraValue)
        .then(value => {
            workmoneys = value;
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function workmoneysum() {
    let ket = "workmoneysum";
    let val = "data6";
    let keyset = ""
    let extraValue = "";
    return getdatatable(ket, val, keyset, (updatedData) => {
        workmoneyssums = updatedData;
    }, false, extraValue)
        .then(value => {
            workmoneyssums = value;
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function machinesums() {
    let ket = "machinesums";
    let val = "data7";
    let keyset = ""
    let extraValue = "";
    return getdatatable(ket, val, keyset, (updatedData) => {
        machinesum = updatedData;
    }, false, extraValue)
        .then(value => {
            machinesum = value;
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

function setselect(machines) {
    let $select = $('#machinetype');
    $select.find("option:not([data-default])").remove();
    machines.filter(machine => machine[2] === "ว่าง").forEach(machine => {
        $select.append(`<option value="${machine[0]}">${machine[1]}</option>`);
    });
}

function machinelists(dataArray) {
    let $container = $('.machinelist');
    $container.empty();

    dataArray.forEach((row, index) => {
        let $newCard = $(`
            <div class="col-12 col-md-4">
                <div class="card mb-1 shadow position-relative">
                    <div class="card-body text-center card-row" data-index="${index}">
                        <img src="${row[2]}" alt="house" class="img-fluid mb-0 rounded mb-1">
                        <p class="card-title fw-bold fs-4 d-none d-md-inline text-custom">${row[1]}</p>
                        <p class="fw-bold addclass">สถานะเครื่อง : <span class="fw-bold">${row[3]}</span></p>
                        <p class="fw-bold checkwork text-custom">งานที่ปัก : <span class="fw-bold">${row[4]}</span></p>
                        <p class="fw-bold checkwork text-custom">ชื่องาน : <span class="fw-bold">${row[5]}</span></p>
                        <p class="fw-bold checkwork text-custom">จำนวนที่ต้องปัก : <span class="fw-bold">${row[6]}</span></p>
                    </div>
                </div>
            </div>
        `);

        if (row[3] === 'ว่าง') {
            $newCard.find('.checkwork').hide();
            $newCard.find('.addclass').addClass('text-success').removeClass('text-danger');
        } else {
            $newCard.find('.checkwork').show();
            $newCard.find('.addclass').addClass('text-danger').removeClass('text-success');
        }

        $container.append($newCard);
    });

    $('.card-row').on('click', function () {
        const index = $(this).data('index');
        const selectedData = dataArray[index];
        if (selectedData[3] === 'ไม่ว่าง') {
            Swal.fire({
                title: 'ต้องการยกเลิกงานใช่หรือไม่ ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#007bff',
                confirmButtonText: 'ใช่, ยกเลิก!',
                cancelButtonText: 'ย้อนกลับ'
            }).then((result) => {
                if (result.isConfirmed) {
                    showhidepage('header');
                    let setstatus = {
                        opt: 'cancelwork',
                        id: selectedData[0],
                    };
                    fetch(scriptUrl, {
                        method: "POST",
                        body: new URLSearchParams(setstatus),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                        .then(response => response.json())
                        .then(res => {
                            if (res.status === 'success') {
                                Swal.fire({
                                    title: res.message,
                                    icon: 'success',
                                    timer: 2000,
                                    showConfirmButton: false
                                }).then(() => {
                                    showhidepage('.machinelists,nav');
                                    machinelist()
                                });
                            } else if (res.status === "error") {
                                Swal.fire({
                                    icon: 'error',
                                    title: res.message,
                                    allowOutsideClick: false,
                                    confirmButtonText: 'ตกลง',
                                }).then(() => {
                                    showhidepage('.machinelists,nav');
                                });
                            }
                        })
                        .catch(err => {
                            showhidepage('.machinelists,nav');
                            console.error(err);
                            Swal.fire({
                                icon: 'error',
                                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                                allowOutsideClick: false,
                                confirmButtonText: 'ตกลง',
                            });
                        });
                }
            });
        }

    });
}


$('.addrows').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    rowform++
    addform(rowform)
});

let initialHeight = window.innerHeight;
let resizeTimeout;

$(window).on("resize", function () {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(function () {
        if (Math.abs(window.innerHeight - initialHeight) < 100) {
            return;
        }
        addform(rowform);
    }, 200);
});


function addform(num, dataArr) {
    let oldData = {};
    $(".worklist input, .worklist textarea").each(function () {
        oldData[this.id] = $(this).val();
    });

    let container = $(".worklist");
    container.empty();

    let width = window.innerWidth;
    let isMobile = width < 576;
    let isIpad = width >= 576 && width < 992;

    for (let i = 0; i < num; i++) {
        let sizeVal = "";
        let qorderVal = "";

        if (dataArr && dataArr[i]) {
            let values = dataArr[i].split(',');
            sizeVal = values[0] || "";
            qorderVal = values[1] || "";
        } else {
            sizeVal = oldData["size" + (i + 1)] || "";
            qorderVal = oldData["qorder" + (i + 1)] || "";
        }

        let lworkVal = oldData["lwork" + (i + 1)] || "";
        let roundVal = oldData["round" + (i + 1)] || "";
        let nworkVal = oldData["nwork" + (i + 1)] || "";
        let aworkVal = oldData["awork" + (i + 1)] || "";

        let newElement;

        if (isMobile) {
            newElement = $(`
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="col-12 mb-2">
                            <label for="size${i + 1}" class="form-label">ไซส์</label>
                            <input type="text" class="form-control keyvalue" id="size${i + 1}" placeholder="ไซส์" autocomplete="off" value="${sizeVal}">
                        </div>
                        <div class="col-12 mb-2">
                            <label for="qorder${i + 1}" class="form-label">สั่งปัก</label>
                            <input type="text" class="form-control keyvalue" id="qorder${i + 1}" placeholder="สั่งปัก" autocomplete="off" value="${qorderVal}">
                        </div>
                        <div class="col-12 mb-2">
                            <label for="lwork${i + 1}" class="form-label">ก่อน/ปัจจุบัน</label>
                            <textarea class="form-control keyvalue" id="lwork${i + 1}" placeholder="ก่อน/ปัจจุบัน" readonly>${lworkVal}</textarea>
                        </div>
                        <div class="col-12 mb-2">
                            <label for="round${i + 1}" class="form-label">จำนวนรอบ</label>
                            <input type="text" class="form-control keyvalue" id="round${i + 1}" placeholder="จำนวนรอบ" autocomplete="off" readonly value="${roundVal}">
                        </div>
                        <div class="col-12 mb-2">
                            <label for="nwork${i + 1}" class="form-label">ยอดปัจจุบัน</label>
                            <input type="text" class="form-control keyvalue" id="nwork${i + 1}" placeholder="ยอดปัจจุบัน" autocomplete="off" readonly value="${nworkVal}">
                        </div>
                        <div class="col-12 mb-2">
                            <label for="awork${i + 1}" class="form-label">ปักเสีย</label>
                            <input type="text" class="form-control keyvalue" id="awork${i + 1}" placeholder="ปักเสีย" autocomplete="off" value="${aworkVal}">
                        </div>
                        <div class="col-12 mb-2">
                            <button class="btn btn-primary w-100 addwork" data-index="${i + 1}">เพิ่ม</button>
                        </div>
                        <div class="col-12 mb-2">
                            <button class="btn btn-danger w-100 backwork" data-index="${i + 1}"><i class="bi bi-arrow-counterclockwise"></i></button>
                        </div>
                        <div class="col-12 mb-2">
                            <button class="btn btn-warning w-100 deletework" data-index="${i + 1}"><i class="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                </div>
            `);
        } else if (isIpad) {
            newElement = $(`
                <div class="row">
                    <div class="col-2 mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="size${i + 1}" autocomplete="off" value="${sizeVal}">
                            <label for="size${i + 1}">ไซส์</label>
                        </div>
                    </div>
                    <div class="col-2 mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="qorder${i + 1}" autocomplete="off" value="${qorderVal}">
                            <label for="qorder${i + 1}">สั่งปัก</label>
                        </div>
                    </div>
                    <div class="col-2 mb-1">
                        <div class="form-floating">
                            <textarea class="form-control keyvalue" id="lwork${i + 1}" autocomplete="off" readonly>${lworkVal}</textarea>
                            <label for="lwork${i + 1}">ก่อน/ปัจจุบัน</label>
                        </div>
                    </div>
                    <div class="col-2 mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="round${i + 1}" autocomplete="off" readonly value="${roundVal}">
                            <label for="round${i + 1}">จำนวนรอบ</label>
                        </div>
                    </div>
                    <div class="col-2 mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="nwork${i + 1}" autocomplete="off" readonly value="${nworkVal}">
                            <label for="nwork${i + 1}">ยอดปัจจุบัน</label>
                        </div>
                    </div>
                    <div class="col-2 mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="awork${i + 1}" autocomplete="off" value="${aworkVal}">
                            <label for="awork${i + 1}">ปักเสีย</label>
                        </div>
                    </div>
                    <div class="col-4 mb-1">
                        <div class="form-floating">
                            <button class="btn btn-primary w-100 h-100 addwork" data-index="${i + 1}">เพิ่ม</button>
                        </div>
                    </div>
                    <div class="col-4 mb-1">
                        <div class="form-floating">
                            <button class="btn btn-danger w-100 h-100 backwork" data-index="${i + 1}"><i class="bi bi-arrow-counterclockwise"></i></button>
                        </div>
                    </div>
                    <div class="col-4 mb-1">
                        <div class="form-floating">
                            <button class="btn btn-warning deletework w-100" data-index="${i + 1}"><i class="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                </div>
                <hr>
            `);
        } else {
            newElement = $(`
                <div class="row">
                    <div class="col mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="size${i + 1}" autocomplete="off" value="${sizeVal}">
                            <label for="size${i + 1}">ไซส์</label>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="qorder${i + 1}" autocomplete="off" value="${qorderVal}">
                            <label for="qorder${i + 1}">สั่งปัก</label>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <textarea class="form-control keyvalue" id="lwork${i + 1}" autocomplete="off" readonly>${lworkVal}</textarea>
                            <label for="lwork${i + 1}">ก่อน/ปัจจุบัน</label>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <button class="btn btn-primary w-100 h-100 addwork" data-index="${i + 1}">เพิ่ม</button>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="round${i + 1}" autocomplete="off" readonly value="${roundVal}">
                            <label for="round${i + 1}">จำนวนรอบ</label>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="nwork${i + 1}" autocomplete="off" readonly value="${nworkVal}">
                            <label for="nwork${i + 1}">ยอดปัจจุบัน</label>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <input class="form-control keyvalue" type="text" id="awork${i + 1}" autocomplete="off" value="${aworkVal}">
                            <label for="awork${i + 1}">ปักเสีย</label>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <button class="btn btn-danger w-100 h-100 backwork" data-index="${i + 1}"><i class="bi bi-arrow-counterclockwise"></i></button>
                        </div>
                    </div>
                    <div class="col mb-1">
                        <div class="form-floating">
                            <button class="btn btn-warning deletework w-100" data-index="${i + 1}"><i class="bi bi-x-lg"></i></button>
                        </div>
                    </div>
                </div>
            `);
        }

        container.append(newElement);
        newElement.find('textarea').on('input', function () {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
}

$(document).on('click', '.deletework', function () {
    const $element = $(this);
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: 'คุณต้องการลบข้อมูลนี้ใช่ไหม?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ต้องการลบ',
        cancelButtonText: 'ยกเลิก'
    }).then(result => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'ยืนยันอีกครั้ง',
                text: 'คุณแน่ใจจริง ๆ ใช่ไหม?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ใช่, แน่ใจ',
                cancelButtonText: 'ยกเลิก'
            }).then(result2 => {
                if (result2.isConfirmed) {
                    Swal.fire({
                        title: 'คำเตือนสุดท้าย',
                        text: 'การลบข้อมูลนี้ไม่สามารถย้อนกลับได้!',
                        icon: 'error',
                        showCancelButton: true,
                        confirmButtonText: 'ลบข้อมูลเลย!',
                        cancelButtonText: 'ยกเลิก'
                    }).then(result3 => {
                        if (result3.isConfirmed) {
                            if (window.innerWidth < 576) {
                                $element.closest('.card').remove();
                            } else {
                                $element.closest('.row').remove();
                            }
                            rowform = $('.worklist').children().length;
                            updateIndices();
                        }
                    });
                }
            });
        }
    });
});

function updateIndices() {
    $(".worklist").children().each(function (index) {
        let newIndex = index + 1;
        $(this).find('input, textarea').each(function () {
            let fieldName = this.id.replace(/[0-9]/g, '');
            $(this).attr('id', fieldName + newIndex);
        });
        $(this).find('label').each(function () {
            let fieldName = $(this).attr('for').replace(/[0-9]/g, '');
            $(this).attr('for', fieldName + newIndex);
        });
        $(this).find('button').each(function () {
            $(this).attr('data-index', newIndex);
        });
    });
}

$(document).on('click', '.addwork', function (e) {
    e.preventDefault();
    e.stopPropagation();
    let index = $(this).data('index');
    let size = $(`#size${index}`).val();
    if (!size || size.trim() === "") {
        Swal.fire({
            title: 'แจ้งเตือน',
            text: 'กรุณาเพิ่มไซส์ที่ต้องการสั่งปักก่อน',
            icon: 'warning',
            confirmButtonText: 'ตกลง'
        });
        return;
    }
    Swal.fire({
        title: `เลือกจำนวนสำหรับ ${size}`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: '20',
        denyButtonText: '18',
        cancelButtonText: 'อื่นๆ'
    }).then((result) => {
        let quantity = 0;
        if (result.isConfirmed) {
            quantity = 20;
            confirmChoice(quantity, index);
        } else if (result.isDenied) {
            quantity = 18;
            confirmChoice(quantity, index);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'ระบุจำนวนที่ต้องการ',
                input: 'number',
                inputLabel: 'จำนวน',
                inputPlaceholder: 'ระบุจำนวนที่ต้องการ',
                showCancelButton: true,
                confirmButtonText: 'ตกลง',
                cancelButtonText: 'ยกเลิก',
                inputValidator: (value) => {
                    if (!value || parseInt(value) <= 0) {
                        return 'กรุณาระบุจำนวนที่ถูกต้อง'
                    }
                }
            }).then((inputResult) => {
                if (inputResult.isConfirmed) {
                    quantity = parseInt(inputResult.value, 10);
                    confirmChoice(quantity, index);
                }
            });
        }
    });

    function confirmChoice(quantity, index) {
        Swal.fire({
            title: 'ยืนยันข้อมูล',
            text: `คุณต้องการยืนยันจำนวน ${quantity} หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ใช่ ยืนยัน',
            cancelButtonText: 'ไม่ ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                let valround = parseInt($(`#round${index}`).val(), 10) || 0;
                valround++;
                let valnow = parseFloat($(`#nwork${index}`).val()) || 0;
                let newVal = parseFloat(quantity) + valnow;
                $('#round' + index).val(valround);
                $('#nwork' + index).val(newVal);
                let $textarea = $(`#lwork${index}`);
                let currentLwork = $textarea.val();
                if (currentLwork) {
                    $textarea.val(currentLwork + '/' + quantity);
                } else {
                    $textarea.val(quantity);
                }
                $textarea.trigger('input');

                let totalNwork = sumwork();
                let totalround = sumround();
                $('#workna').val(totalround);
                $('#worknb').val(totalNwork);
                const handleAsyncEvent = async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let idform = "newwork";
                    let itemData = await getFormData(idform);

                    let aworkIds = [];
                    $('input[id^="awork"]').each(function () {
                        aworkIds.push($(this).attr('id'));
                    });
                  
                    let qorderIds = [];
                    $('input[id^="qorder"]').each(function () {
                        qorderIds.push($(this).attr('id'));
                    });
                    
                    let allIds = aworkIds.concat(qorderIds);
                  

                    if (!checkvalue(itemData, allIds)) {
                        let $textarea = $(`#lwork${index}`);
                        let currentLwork = $textarea.val();

                        if (!currentLwork) {
                            Swal.fire("ไม่มีข้อมูลที่จะย้อนกลับ");
                            return;
                        }

                        let records = currentLwork.split('/');
                        if (records.length === 0) {
                            Swal.fire("ไม่มีข้อมูลที่จะย้อนกลับ");
                            return;
                        }

                        records.pop();
                        let newLwork = records.join('/');
                        $textarea.val(newLwork);
                        $textarea.trigger('input');

                        $(`#round${index}`).val(records.length);
                        let newNwork = records.reduce((total, item) => total + (parseFloat(item) || 0), 0);
                        $(`#nwork${index}`).val(newNwork);
                        let totalNwork = sumwork();
                        let totalRound = sumround();
                        $('#workna').val(totalRound);
                        $('#worknb').val(totalNwork);
                    } else {
                        let vcheck = $(`#size${index}`).val();
                        saveround(itemData, quantity, vcheck, index);
                    }
                };

                handleAsyncEvent(e)
            }
        });
    }

})

$(document).on('click', '.backwork', function (e) {
    e.preventDefault();
    e.stopPropagation();
    let index = $(this).data('index');

    Swal.fire({
        title: 'คุณต้องการย้อนกลับข้อมูลหรือไม่?',
        text: 'การย้อนกลับจะลบการบันทึกล่าสุดออก',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ย้อนกลับ',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            let $textarea = $(`#lwork${index}`);
            let currentLwork = $textarea.val();
            if (!currentLwork) {
                Swal.fire("ไม่มีข้อมูลที่จะย้อนกลับ");
                return;
            }

            let records = currentLwork.split('/');
            if (records.length === 0) {
                Swal.fire("ไม่มีข้อมูลที่จะย้อนกลับ");
                return;
            }

            let lnum = records[records.length - 1];
            records.pop();
            let newLwork = records.join('/');
            let newNwork = records.reduce((total, item) => total + (parseFloat(item) || 0), 0);
            let vcheck = $(`#size${index}`).val();
            $(`#lwork${index}`).val(newLwork);
            $(`#lwork${index}`).trigger('input');
            $(`#round${index}`).val(records.length);
            $(`#nwork${index}`).val(newNwork);

            let totalNwork = sumwork();
            let totalRound = sumround();
            $('#workna').val(totalRound);
            $('#worknb').val(totalNwork);
            const handleAsyncEvent = async function (e) {
                e.preventDefault();
                e.stopPropagation();
                let idform = "newwork";
                let itemData = await getFormData(idform);
               let aworkIds = [];
                    $('input[id^="awork"]').each(function () {
                        aworkIds.push($(this).attr('id'));
                    });
                  
                    let qorderIds = [];
                    $('input[id^="qorder"]').each(function () {
                        qorderIds.push($(this).attr('id'));
                    });
                    
                    let allIds = aworkIds.concat(qorderIds);

                if (!checkvalue(itemData, allIds)) {
                } else {
                    saveround2(itemData, vcheck, lnum);
                }
            };

            handleAsyncEvent(e)
        }
    });
});

function sumwork() {
    let total = 0;
    $('.worklist input[id^="nwork"]').each(function () {
        let value = parseFloat($(this).val()) || 0;
        total += value;
    });
    return total;
}

function sumround() {
    let total = 0;
    $('.worklist input[id^="round"]').each(function () {
        let value = parseFloat($(this).val()) || 0;
        total += value;
    });
    return total;
}

$('#pmwork').on('input', function () {
    let val1 = parseFloat($(this).val() || 0);
    let val2 = parseFloat($('#towork').val() || 0);
    $('#toawork').val(val2 * val1);
});

async function promptForImage(title, confirmText) {
    while (true) {
        const result = await Swal.fire({
            title: title,
            input: 'file',
            inputAttributes: {
                accept: 'image/*',
                capture: 'camera'
            },
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: confirmText,
            preConfirm: (file) => {
                if (!file) {
                    Swal.showValidationMessage('กรุณาถ่ายภาพ');
                }
                return file;
            }
        });
        if (result.value) return result.value;
    }
}

async function uploadImageWithRetry(file, promptTitle) {
  const idcheck = $('.idwork').data('idwork');
  while (true) {
    try {
      const link = await uploadToImgbb(file, idcheck);
      return link;
    } catch (error) {
      const retry = await Swal.fire({
        title: 'อัปโหลดไม่สำเร็จ',
        text: 'ต้องการอัปโหลดใหม่หรือไม่?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'อัปโหลดใหม่',
        cancelButtonText: 'ยกเลิก'
      });
      if (retry.isConfirmed) {
        file = await promptForImage(promptTitle, 'ถัดไป');
      } else {
        throw new Error('Upload cancelled by user');
      }
    }
  }
}

async function saveround(itemData, quantity, vcheck, index) {
    let setstatus = {
        opt: 'saveround',
        idcheck: $('.idwork').data('idwork'),
        rounds: quantity,
        sizes: vcheck,
        ...itemData
    };

    try {
        const response = await fetch(scriptUrl, {
            method: "POST",
            body: new URLSearchParams(setstatus),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const res = await response.json();

        if (res.status === 'success') {
            $('#workflow').val(parseFloat($('#workflow').val() || 0) + parseFloat(quantity) || 0);
            $('#worktotal').val(parseFloat($('#worktotal').val() || 0) - parseFloat(quantity) || 0);

            if ($('.idwork').data('uploaded')) {
                let time = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
                localStorage.setItem('timeend', time);
                function parseThaiDate(s) {
                    const [date, time] = s.split(' ');
                    const [d, m, y] = date.split('/').map(Number);
                    const [h, mi, sec] = time.split(':').map(Number);
                    return new Date(y - 543, m - 1, d, h, mi, sec);
                }
                const timestart = localStorage.getItem('timestart');
                const timeend = localStorage.getItem('timeend');
                if (timestart && timeend) {
                    const totalSeconds = (parseThaiDate(timeend) - parseThaiDate(timestart)) / 1000;
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = Math.floor(totalSeconds % 60);
                    const duration = minutes + " นาที " + seconds + " วิ";
                    $('#worktime').val(duration);
                }
                localStorage.setItem('timestart', time);
                return;
            }

            const file1 = await promptForImage('ถ่ายภาพที่ 1 เพื่อ QC งาน', 'ถัดไป');
            const file2 = await promptForImage('ถ่ายภาพที่ 2 เพื่อ QC งาน', 'บันทึก');

            const link1 = await uploadImageWithRetry(file1, 'ถ่ายภาพที่ 1 ใหม่');
            const link2 = await uploadImageWithRetry(file2, 'ถ่ายภาพที่ 2 ใหม่');
            const links = [link1, link2];

            let setstatusImg = {
                opt: 'imgqc',
                img: links.join(','),
                idcheck: $('.idwork').data('idwork'),
                ...itemData
            };

            const responseImg = await fetch(scriptUrl, {
                method: "POST",
                body: new URLSearchParams(setstatusImg),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const resImg = await responseImg.json();

            if (resImg.status === 'success') {
                $('.idwork').data('uploaded', true);
                let time = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
                localStorage.setItem('timeend', time);
                function parseThaiDate(s) {
                    const [date, time] = s.split(' ');
                    const [d, m, y] = date.split('/').map(Number);
                    const [h, mi, sec] = time.split(':').map(Number);
                    return new Date(y - 543, m - 1, d, h, mi, sec);
                }
                const timestart = localStorage.getItem('timestart');
                const timeend = localStorage.getItem('timeend');
                if (timestart && timeend) {
                    const totalSeconds = (parseThaiDate(timeend) - parseThaiDate(timestart)) / 1000;
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = Math.floor(totalSeconds % 60);
                    const duration = minutes + " นาที " + seconds + " วิ";
                    $('#worktime').val(duration);
                }
                localStorage.setItem('timestart', time);
            } else if (resImg.status === "error") {
                Swal.fire({
                    icon: 'error',
                    title: resImg.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง'
                });
            }
        } else if (res.status === "error") {
            if (res.keyset === 'return') {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    let $textarea = $(`#lwork${index}`);
                    let currentLwork = $textarea.val();
                    if (!currentLwork) {
                        Swal.fire("ไม่มีข้อมูลที่จะย้อนกลับ");
                        return;
                    }
                    let records = currentLwork.split('/');
                    if (records.length === 0) {
                        Swal.fire("ไม่มีข้อมูลที่จะย้อนกลับ");
                        return;
                    }
                    records.pop();
                    let newLwork = records.join('/');
                    $textarea.val(newLwork);
                    $textarea.trigger('input');
                    $(`#round${index}`).val(records.length);
                    let newNwork = records.reduce((total, item) => total + (parseFloat(item) || 0), 0);
                    $(`#nwork${index}`).val(newNwork);

                    let totalNwork = sumwork();
                    let totalRound = sumround();
                    $('#workna').val(totalRound);
                    $('#worknb').val(totalNwork);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง'
                }).then(() => { });
            }
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
            allowOutsideClick: false,
            confirmButtonText: 'ตกลง'
        });
    }
}

function saveround2(itemData, vcheck, lnum) {
    let setstatus = {
        opt: 'saveround2',
        idcheck: $('.idwork').data('idwork'),
        rounds: lnum,
        sizes: vcheck,
        ...itemData
    };
    fetch(scriptUrl, {
        method: "POST",
        body: new URLSearchParams(setstatus),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                $('#workflow').val(parseFloat($('#workflow').val() || 0) - parseFloat(lnum) || 0)
                $('#worktotal').val(parseFloat($('#worktotal').val() || 0) + parseFloat(lnum) || 0)
            } else if (res.status === "error") {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                });
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                allowOutsideClick: false,
                confirmButtonText: 'ตกลง',
            });
        })
}
function saveroundwork(itemData, status) {
    showhidepage('header');
    let setstatus = {
        opt: 'saveround',
        statuswork: status,
        idcheck: $('.idwork').data('idwork'),
        ...itemData
    };
    fetch(scriptUrl, {
        method: "POST",
        body: new URLSearchParams(setstatus),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                getdata()
                $('.idwork').data('uploaded', '');
                Swal.fire({
                    title: res.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    showhidepage('.newwork,nav');
                    showhidepage2('.newwork,nav');
                    clearForm('newwork');
                    let container = $(".worklist");
                    container.empty();
                    $('.logout').trigger('click')
                });
            } else if (res.status === "error") {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    showhidepage('.newwork,nav');
                });
            }
        })
        .catch(err => {
            showhidepage('.newwork,nav');
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                allowOutsideClick: false,
                confirmButtonText: 'ตกลง',
            });
        });
}

function savebill(itemData, ids) {
    showhidepage('header');
    let setstatus = {
        opt: 'savebill',
        ...itemData,
        ...ids
    };
    fetch(scriptUrl, {
        method: "POST",
        body: new URLSearchParams(setstatus),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                getdata()
                Swal.fire({
                    title: res.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    $('.cancelbill').trigger('click')
                    showhidepage('.billwork,nav');
                });
            } else if (res.status === "error") {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    showhidepage('.editbill,nav');
                });
            }
        })
        .catch(err => {
            showhidepage('.editbill,nav');
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                allowOutsideClick: false,
                confirmButtonText: 'ตกลง',
            });
        });
}

$(window).on("resize", function () {
    listwork(worklistall);
});

$('#search').on('input', function () {
    currentPage = 1;
    listwork(worklistall);
});

$('#listSelect').on('change', function () {
    let selectedValue = $(this).val();
    totalPages = selectedValue === 'All' ? worklistall.length : parseInt(selectedValue);
    currentPage = 1;
    listwork(worklistall);
});

function listwork(data) {
    let cardContainer = $('#worktables');
    cardContainer.empty();

    let searchValue = $('#search').val().toLowerCase().trim();

    let filteredData = data.filter(row => {
        if (row[10] !== "") return false;
        let dataMatches = row.some(cell => cell && cell.toString().toLowerCase().includes(searchValue));
        let matchingRoom = worklistall.find(room => room[0] === row[0]);
        let roomMatches = matchingRoom ? matchingRoom.some(cell => cell && cell.toString().toLowerCase().includes(searchValue)) : false;
        return dataMatches || roomMatches;
    });

    let startIndex = (currentPage - 1) * totalPages;
    let endIndex = startIndex + totalPages;
    let pageData = filteredData.slice(startIndex, endIndex);

    pageData.forEach(function (row, idx) {
        let cardHtml = createCardwork(row, idx);
        let cardElement = $(cardHtml);
        cardElement.find('.editworks').data('rowData', row);
        cardContainer.append(cardElement);
    });

    $('.bill').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        let row = $(this).closest('.editworks').data('rowData');
        $('#towork').val(row[12])
        showhidepage('.billwork,nav');
    });

    $('.editworks').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        let container = $(".worknewlist");
        container.empty();
        let rowData = $(this).data('rowData');
        $('.updatework').show()
        $('.status').text('แก้ไขงาน ' + rowData[1]);
        showhidepage('.editwork,nav');
        $('.status').data('uuid', rowData[0]);
        $('#workid').val(rowData[1])
        $('#workname').val(rowData[2])
        $('#cname').val(rowData[3])
        $('#workadd').val(rowData[5])
        $('#workposition').val(rowData[6])
        $('#workneedle').val(rowData[7])
        if (rowData[8] !== '') {
            let $previewImg = $('<img>', {
                id: 'previewImage',
                src: rowData[8],
                class: 'img-fluid rounded',
                alt: 'Cropped Image',
                css: { cursor: 'pointer' }
            });

            $previewImg.on('click', function () {
                openImagePopup(rowData[8]);
            });
            $('.workimagePreview').html($previewImg);
        } else {
            $('.workimagePreview').html('');
        }
        $('input[name="typeclass"][value="' + rowData[4] + '"]').prop('checked', true);
        let dataParts = rowData[9].split('|')
        rownewform = dataParts.length
        addnewform(rownewform, dataParts)
        $('input[id^="qorder"]').trigger('input');
    });

    createPagination('#listpage', Math.ceil(filteredData.length / totalPages), currentPage, function (newPage) {
        currentPage = newPage;
        listwork(data);
    });
}

function createCardwork(row, rowIndex) {
    let imageHTML = '';
    if (typeof row[8] === 'string' && row[8].startsWith('https://lh3.googleusercontent.com/d/')) {
        imageHTML = `
            <img
                src="${row[8]}"
                alt="Image"
                onerror="this.onerror=null;this.src='';this.closest('.card-content').innerHTML='ไม่ได้ระบุภาพ';"
                class="img-thumbnail"
                style="max-width: 50px; height: 50px;"
                onclick="openImagePopup('${row[8]}')"
            />
        `;
    }

    let cardHTML = `
       <div class="col-md-4 col-12 mb-1">
            <div class="card mb-1 shadow-sm editworks" data-row="${rowIndex}">
                <div class="card-body">
                    <div class="card-content">
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="card-title mb-1 fs-5 fw-bold">รหัสงาน: ${row[1]}</p>
                            <div class="d-flex gap-2 align-items-center">
                                ${imageHTML ? `<div onclick="event.stopPropagation()">${imageHTML}</div>` : ''}
                            </div>
                        </div>
                        <p class="card-text mb-1">ชื่องาน: ${row[2]}</p>
                        <p class="card-text mb-1">ชื่อลูกค้า: ${row[3]}</p>
                        <hr>
                        <p class="card-text mb-1 fs-5">รายละเอียด</p>
                        <p class="card-text mb-1">สั่งปัก: ${row[4]}</p>
                        <p class="card-text mb-1">จำนวน: ${row[5]}</p>
                        <p class="card-text mb-1">ตำแหน่ง : ${row[6]}</p>
                        <p class="card-text mb-1">จำนวนเข็ม : ${row[7]}</p>
                        <hr>
                        <p class="card-text mb-1 fs-5">${row[10] ? 'สถานะงาน' : ''}</p>
                        <p class="card-text mb-1">${row[10]} <span>${checkAndFormatDate(row[11])}</span></p>
                    </div>
                </div>
            </div>
        </div>
`;

    return cardHTML;
}

function checkAndFormatDate(cellData) {
    if (typeof cellData === 'string') {
        if ((cellData.includes('T') && cellData.includes('Z')) || cellData.includes('GMT')) {
            return formatDate(cellData);
        }
    }
    return cellData;
}

$('.addnewrows').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    rownewform++
    addnewform(rownewform)
});

$(window).on("resize", function () {
    addnewform(rownewform)
});

function addnewform(num, dataArr) {
    let oldData = {};
    $(".worknewlist input").each(function () {
        oldData[this.id] = $(this).val();
    });

    let container = $(".worknewlist");
    container.empty();

    for (let i = 0; i < num; i++) {
        let sizeVal = "";
        let qorderVal = "";

        if (dataArr && dataArr[i]) {
            let values = dataArr[i].split(',');
            sizeVal = values[0] || "";
            qorderVal = values[1] || "";
        } else {
            if (oldData["size" + (i + 1)] !== undefined) {
                sizeVal = oldData["size" + (i + 1)];
            }
            if (oldData["qorder" + (i + 1)] !== undefined) {
                qorderVal = oldData["qorder" + (i + 1)];
            }
        }

        let newElement = $(`
            <div class="row">
                <div class="col mb-1">
                    <div class="form-floating">
                        <input class="form-control keyvalue" type="text" placeholder="ไซส์" aria-label="ไซส์" id="size${i + 1}" autocomplete="off" value="${sizeVal}">
                        <label for="size${i + 1}">ไซส์</label>
                    </div>
                </div>
                <div class="col mb-1">
                    <div class="form-floating">
                        <input class="form-control keyvalue" type="text" placeholder="สั่งปัก" aria-label="สั่งปัก" id="qorder${i + 1}" autocomplete="off" value="${qorderVal}">
                        <label for="qorder${i + 1}">สั่งปัก</label>
                    </div>
                </div>
                <div class="col mb-1">
                    <div class="form-floating">
                        <button class="btn btn-warning w-100 h-100 deleteNewForm" data-index="${i + 1}"><i class="bi bi-x-lg"></i></button>
                    </div>
                </div>
            </div>
        `);
        container.append(newElement);
    }
}

function updateNewFormIndices() {
    $('.worknewlist .row').each(function (index) {
        let newIndex = index + 1;
        $(this).find('input').each(function () {
            let fieldName = this.id.replace(/[0-9]/g, '');
            $(this).attr('id', fieldName + newIndex);
        });
        $(this).find('label').each(function () {
            let fieldName = $(this).attr('for').replace(/[0-9]/g, '');
            $(this).attr('for', fieldName + newIndex);
        });
        $(this).find('button').each(function () {
            $(this).attr('data-index', newIndex);
        });
    });
}

$(document).on('click', '.deleteNewForm', function () {
    const $element = $(this);
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: 'คุณต้องการลบข้อมูลนี้ใช่ไหม?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ต้องการลบ',
        cancelButtonText: 'ยกเลิก'
    }).then(result => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'ยืนยันอีกครั้ง',
                text: 'คุณแน่ใจจริง ๆ ใช่ไหม?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'ใช่, แน่ใจ',
                cancelButtonText: 'ยกเลิก'
            }).then(result2 => {
                if (result2.isConfirmed) {
                    Swal.fire({
                        title: 'คำเตือนสุดท้าย',
                        text: 'การลบข้อมูลนี้ไม่สามารถย้อนกลับได้!',
                        icon: 'error',
                        showCancelButton: true,
                        confirmButtonText: 'ลบข้อมูลเลย!',
                        cancelButtonText: 'ยกเลิก'
                    }).then(result3 => {
                        if (result3.isConfirmed) {
                            rownewform--;
                            $element.closest('.row').remove();
                            updateNewFormIndices();
                            Swal.fire('ลบข้อมูลสำเร็จ!', '', 'success');
                        }
                    });
                }
            });
        }
    });
});

$('.backaddnewwork').click(function (e) {
    e.preventDefault();
    $('.status').data('uuid', '');
});

$('.savenewwork').click(async function (e) {
    e.preventDefault();
    let vals = $(this).data('savetype');
    if (vals === 'savenewwork2') {
        let uuids = crypto.randomUUID();
        $('.status').data('uuid', uuids);
    }
    let idform = "editwork";
    let status = $('.status').data('uuid');
    let itemData = await getFormData(idform);
    if (!checkvalue(itemData, [])) {
    } else {
        savenewwork(itemData, status);
    }
});

function savenewwork(itemData, status) {
    showhidepage('header');
    let setstatus = {
        opt: 'addnewwork',
        uuid: status,
        ...itemData
    };
    fetch(scriptUrl, {
        method: "POST",
        body: new URLSearchParams(setstatus),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                getdata()
                Swal.fire({
                    title: res.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    $('.status').data('uuid', '');
                    showhidepage('.addnewwork,nav');
                    clearForm('editwork');
                });
            } else if (res.status === "error") {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    showhidepage('.editwork,nav');
                });
            }
        })
        .catch(err => {
            showhidepage('.editwork,nav');
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                allowOutsideClick: false,
                confirmButtonText: 'ตกลง',
            });
        });
}

$('.searchinfo').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    machineslist();
    $('.checkin').show()
    let container = $(".worklist");
    container.empty();
    let search = $('#idwork').val();
    let filtered = worklistall.filter(row => row[1] === search && row[10] === '');

    if (filtered.length === 1) {
        let result = filtered[0];
        $('.idwork').data('idwork', result[0]);
        $('#qneedle').val(result[7]);
        $('#pname').val(result[2]);
        $('#epos').val(result[6]);
        $('#workall').val(result[5]);
        $('#workflow').val(result[12] || 0);
        $('#worktotal').val(parseFloat(result[5] || 0) - parseFloat(result[12] || 0));
        if (result[8] !== '') {
            $('.imagepreview').attr('src', result[8]);
            $('.imagepreview').show()
        } else {
            $('.imagepreview').hide()
        }
        $('input[name="typeclass"][value="' + result[4] + '"]').prop('checked', true);
        let dataParts = result[9].split('|')
        rowform = dataParts.length
        addform(rowform, dataParts)
        showhidepage2('.worklist,.wtype,.wmachine,nav');
        $('.wset').hide()
    } else if (filtered.length > 1) {
        let buttonsHtml = '';

        let emojiMapping = {
            'ชาย': '👨‍🦱',
            'หญิง': '👩‍🦰',
            'เด็ก': '👶',
            'กระเป๋า': '👜'
        };

        filtered.forEach(function (row) {
            let emoji = emojiMapping[row[4]] || '😊';
            buttonsHtml += `
            <button class="btn btn-outline-secondary btn-select w-100 mb-1" data-key="${row[0]}">
                ${emoji} ${row[4]}
            </button>
            `;
        });

        Swal.fire({
            title: 'กรุณาเลือกตัวเลือก',
            html: buttonsHtml,
            showConfirmButton: false,
            customClass: {
                popup: 'border-0 shadow',
                title: 'h4'
            }
        });

        $('.btn-select').on('click', function () {
            let selectedKey = $(this).data('key');
            let furtherFilter = filtered.filter(row => row[0] === selectedKey);
            let result = furtherFilter[0];
            $('.idwork').data('idwork', result[0]);
            $('#qneedle').val(result[7]);
            $('#pname').val(result[2]);
            $('#epos').val(result[6]);
            $('#workall').val(result[5]);
            $('#workflow').val(result[12] || 0);
            $('#worktotal').val(parseFloat(result[5] || 0) - parseFloat(result[12] || 0));
            if (result[8] !== '') {
                $('.imagepreview').attr('src', result[8]);
                $('.imagepreview').show()
            } else {
                $('.imagepreview').hide()
            }
            let dataParts = result[9].split('|')
            rowform = dataParts.length
            addform(rowform, dataParts)
            showhidepage2('.worklist,.wtype,.wmachine,nav');
            $('.wset').hide()
            Swal.close();
        });
    } else {
        console.log('No match found');
    }
});

function saveworkstone(itemData) {
    showhidepage('header');
    let setstatus = {
        opt: 'saveworkstone',
        ...itemData
    };
    fetch(scriptUrl, {
        method: "POST",
        body: new URLSearchParams(setstatus),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(res => {
            if (res.status === 'success') {
                getdata()
                Swal.fire({
                    title: res.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    showhidepage('.addworkstone,nav');
                    clearForm('addworkstone');
                });
            } else if (res.status === "error") {
                Swal.fire({
                    icon: 'error',
                    title: res.message,
                    allowOutsideClick: false,
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    showhidepage('.addworkstone,nav');
                });
            }
        })
        .catch(err => {
            showhidepage('.addworkstone,nav');
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
                allowOutsideClick: false,
                confirmButtonText: 'ตกลง',
            });
        });
}

const uploadToImgbb = (file, idcheck) => {
 return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result.split(',')[1];
      // เตรียม form data แบบ url-encoded
      const params = new URLSearchParams({
        opt: 'uploadImage',
        idcheck,
        image: base64Image
      });
      fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params
      })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success') {
          resolve(res.link);
        } else {
          reject(new Error(res.message));
        }
      })
      .catch(err => reject(err));
    };
    reader.onerror = err => reject(err);
    reader.readAsDataURL(file);
  });
};

$(window).on("resize", function () {
    listbill(worklistall);
});

$('#searchbill').on('input', function () {
    currentPage = 1;
    listbill(worklistall);
});

$('#listSelectbill').on('change', function () {
    let selectedValue = $(this).val();
    totalPages = selectedValue === 'All' ? worklistall.length : parseInt(selectedValue);
    currentPage = 1;
    listbill(worklistall);
});

function listbill(data) {
    let cardContainer = $('#billtables');
    cardContainer.empty();

    let searchbillValue = $('#searchbill').val().toLowerCase().trim();

    let filteredData = data.filter(row => {
        if (row[10] === "") return false;
        if (row[13] !== "") return false;
        let dataMatches = row.some(cell => cell && cell.toString().toLowerCase().includes(searchbillValue));
        let matchingRoom = worklistall.find(room => room[0] === row[0]);
        let roomMatches = matchingRoom ? matchingRoom.some(cell => cell && cell.toString().toLowerCase().includes(searchbillValue)) : false;
        return dataMatches || roomMatches;
    });


    let startIndex = (currentPage - 1) * totalPages;
    let endIndex = startIndex + totalPages;
    let pageData = filteredData.slice(startIndex, endIndex);

    pageData.forEach(function (row, idx) {
        let cardHtml = createCardbill(row, idx);
        let cardElement = $(cardHtml);
        cardElement.find('.editbills').data('rowData', row);
        cardContainer.append(cardElement);
    });

    $('.billselected').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        let selectedRows = [];
        $('.select-item:checked').each(function () {
            let row0Str = $(this).attr('data-row0');
            let row0 = JSON.parse(row0Str);
            selectedRows.push(row0);
        });

        if (selectedRows.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'ไม่มีการเลือก',
                text: 'กรุณาเลือกอย่างน้อยหนึ่งรายการ'
            });
            return;
        }
        addnewnote(selectedRows.length, selectedRows);
        showhidepage('.editbill,nav');
    });

    createPagination('#listpagebill', Math.ceil(filteredData.length / totalPages), currentPage, function (newPage) {
        currentPage = newPage;
        listbill(data);
    });
}

function createCardbill(row, rowIndex) {
    let imageHTML = '';
    if (typeof row[8] === 'string' && row[8].startsWith('https://lh3.googleusercontent.com/d/')) {
        imageHTML = `
            <img
                src="${row[8]}"
                alt="Image"
                onerror="this.onerror=null;this.src='';this.closest('.card-content').innerHTML='ไม่ได้ระบุภาพ';"
                class="img-thumbnail"
                style="max-width: 50px; height: 50px;"
                onclick="openImagePopup('${row[8]}')"
            />
        `;
    }

    let cardHTML = `
       <div class="col-md-4 col-12 mb-1">
            <div class="card mb-1 shadow-sm editbills" data-row="${rowIndex}">
                <div class="card-body">
                    <div class="card-content">
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="card-title mb-1 fs-5 fw-bold">รหัสงาน: ${row[1]}</p>
                            <div class="d-flex gap-2 align-items-center">
                                ${imageHTML ? `<div onclick="event.stopPropagation()">${imageHTML}</div>` : ''}
                            </div>
                        </div>
                        <p class="card-text mb-1">ชื่องาน: ${row[2]}</p>
                        <p class="card-text mb-1">ชื่อลูกค้า: ${row[3]}</p>
                        <hr>
                        <p class="card-text mb-1 fs-5">รายละเอียด</p>
                        <p class="card-text mb-1">สั่งปัก: ${row[4]}</p>
                        <p class="card-text mb-1">จำนวน: ${row[5]}</p>
                        <p class="card-text mb-1">ตำแหน่ง : ${row[6]}</p>
                        <p class="card-text mb-1">จำนวนเข็ม : ${row[7]}</p>
                        <hr>
                        <div class="mb-2">
                            <input type="checkbox" class="btn-check select-item" data-row0='${JSON.stringify(row)}' id="select-${rowIndex}" autocomplete="off">
                            <label class="btn btn-outline-primary w-100" for="select-${rowIndex}">เลือก</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    return cardHTML;
}

$('.cancelbill').click(function (e) {
    e.preventDefault();
    let container = $(".billlist");
    container.empty();
});

function addnewnote(num, dataArr) {
    let oldData = {};
    $(".billlist input").each(function () {
        oldData[this.id] = $(this).val();
    });

    let container = $(".billlist");
    container.empty();

    for (let i = 0; i < num; i++) {
        let id = "";
        let priceVal = "";
        let note = "";
        let dataIdValue = "";

        if (dataArr && dataArr[i]) {
            let values = dataArr[i];
            dataIdValue = values[0];
            id = values[1] + ' ' + values[2] || "";
            priceVal = values[13] || "";
            note = values[15] || "";
        } else {
            if (oldData["id" + (i + 1)] !== undefined) {
                id = oldData["id" + (i + 1)];
            }
            if (oldData["price" + (i + 1)] !== undefined) {
                priceVal = oldData["price" + (i + 1)];
            }
            if (oldData["note" + (i + 1)] !== undefined) {
                note = oldData["note" + (i + 1)];
            }
        }

        let newElement = $(`
            <div class="row">
                <p class="fw-bold fs-5" id="id${i + 1}" data-ids${i + 1}="${dataIdValue}">${id}</p>
                <div class="col mb-1">
                    <div class="form-floating">
                        <input class="form-control keyvalue" type="text" placeholder="ราคาต่อชิ้น" aria-label="ราคาต่อชิ้น" id="price${i + 1}" autocomplete="off" value="${priceVal}">
                        <label for="price${i + 1}">ราคาต่อชิ้น</label>
                    </div>
                </div>
                <div class="col mb-1">
                    <div class="form-floating">
                        <input class="form-control keyvalue" type="text" placeholder="หมายเหตุ" aria-label="หมายเหตุ" id="note${i + 1}" autocomplete="off" value="${note}">
                        <label for="note${i + 1}">หมายเหตุ</label>
                    </div>
                </div>
            </div>
        `);
        container.append(newElement);
    }
}

let $myChart2 = $('#myChart2');
let ctx2 = $myChart2[0].getContext('2d');
let myChart2 = new Chart(ctx2, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
    }
});

function adjustDate(dateStr) {
    let dateObj = new Date(dateStr);
    if (dateObj.getHours() < 8) {
        dateObj.setDate(dateObj.getDate() - 1);
    }
    return dateObj;
}

function getShift(dateStr) {
    const dateObj = adjustDate(dateStr);
    const hour = dateObj.getHours();
    return (hour >= 8 && hour < 20) ? 'เช้า' : 'ดึก';
}

function getThaiDate(dateStr) {
    const dateObj = adjustDate(dateStr);
    const year = dateObj.getFullYear() - 543;
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    const day = ('0' + dateObj.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

function summoney() {
    let dailyTotals = {};

    workmoneys.forEach(item => {
        const date = getThaiDate(item[2]);
        const shift = getShift(item[2]);
        const key = `${date}_${shift}`;
        const id = item[0];
        const amount = item[1];
        const found = worklistall.find(record => record[1] === id);
        if (found) {
            const multiplier = found[13];
            if (!dailyTotals[key]) {
                dailyTotals[key] = { date: date, shift: shift, total: 0 };
            }
            dailyTotals[key].total += multiplier * amount;
        }
    });

    return Object.values(dailyTotals);
}

function updateChart2() {
    const startDate = $('#datestartwork2').val();
    const endDate = $('#dateendtwork2').val();

    const dataArr = summoney().filter(item => {
        return (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate);
    }).sort((a, b) => a.date.localeCompare(b.date));

    let $table = $('.shiftTable2 tbody');
    $table.empty();
    dataArr.forEach(item => {
        let tr = $('<tr></tr>');
        tr.append('<td>' + item.date + '</td>');
        tr.append('<td>' + item.shift + '</td>');
        tr.append('<td>' + item.total + '</td>');
        $table.append(tr);
    });

    let labels = [...new Set(dataArr.map(item => item.date))];
    labels.sort();
    let dayShiftData = labels.map(date => {
        let found = dataArr.find(item => item.date === date && item.shift === 'เช้า');
        return found ? found.total : 0;
    });
    let nightShiftData = labels.map(date => {
        let found = dataArr.find(item => item.date === date && item.shift === 'ดึก');
        return found ? found.total : 0;
    });

    myChart2.data.labels = labels;
    myChart2.data.datasets = [
        {
            label: 'เช้า',
            data: dayShiftData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },
        {
            label: 'ดึก',
            data: nightShiftData,
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }
    ];
    myChart2.update();

    const overallSum = dataArr.reduce((acc, item) => acc + item.total, 0);
    $('#moneywork').val(overallSum.toLocaleString('en-US'));
}


let $myChart3 = $('#myChart3');
let ctx3 = $myChart3[0].getContext('2d');
let myChart3 = new Chart(ctx3, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
    }
});

function summoney2() {
    let monthlyTotals = {};
    workmoneyssums.forEach(item => {
        const monthYear = getThaiMonthYear(item[2]);
        const id = item[0];
        const amount = item[1];
        const name = item[3];
        const found = worklistall.find(record => record[1] === id);
        if (found) {
            const multiplier = found[13];
            if (!monthlyTotals[monthYear]) {
                monthlyTotals[monthYear] = {};
            }
            if (!monthlyTotals[monthYear][name]) {
                monthlyTotals[monthYear][name] = 0;
            }
            monthlyTotals[monthYear][name] += multiplier * amount;
        }
    });
    return monthlyTotals;
}


function updateChart3() {

    const dailyTotalsObj = summoney2();
    const monthYear = $('#monthwork').val();
    let filteredData = [];
    for (const [date, namesObj] of Object.entries(dailyTotalsObj)) {
        if (!monthYear || date === monthYear) {
            for (const [name, total] of Object.entries(namesObj)) {
                filteredData.push({ date, name, total });
            }
        }
    }

    filteredData.sort((a, b) => a.date.localeCompare(b.date));

    const dates = [...new Set(filteredData.map(item => item.date))].sort((a, b) => a.localeCompare(b));
    const names = [...new Set(filteredData.map(item => item.name))].sort();

    const colors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    const borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    const datasets = names.map((name, index) => {
        const dataArr = dates.map(date => {
            const record = filteredData.find(item => item.date === date && item.name === name);
            return record ? record.total : 0;
        });
        return {
            label: name,
            data: dataArr,
            backgroundColor: colors[index % colors.length],
            borderColor: borderColors[index % borderColors.length],
            borderWidth: 1
        };
    });

    myChart3.data.labels = dates;
    myChart3.data.datasets = datasets;
    myChart3.update();

    filteredData.sort((a, b) => b.total - a.total);
    let $table = $('.shiftTable3 tbody');
    $table.empty();
    filteredData.forEach(function (item) {
        let tr = $('<tr></tr>');
        tr.append('<td>' + item.date + '</td>');
        tr.append('<td>' + item.name + '</td>');
        tr.append('<td>' + item.total + '</td>');
        $table.append(tr);
    });

    const overallSum = filteredData.reduce((acc, item) => acc + item.total, 0);
    console.log(overallSum)

    $('#moneywork3').val(overallSum.toLocaleString('en-US'));
}

function getThaiMonthYear(dateStr) {
    const dateObj = new Date(dateStr);
    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
    return `${year}-${month}`;
}

let $myChart4 = $('#myChart4');
let ctx4 = $myChart4[0].getContext('2d');
let myChart4 = new Chart(ctx4, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString('en-US');
                    }
                }
            }
        }
    }
});

function updateChart4() {
    let startDate = $('#datestartwork4').val();
    let endDate = $('#dateendtwork4').val();
    let summary = {};
    machinesum.forEach(ms => {
        let date = convertToAD(ms[0]);
        let dateObj = new Date(date);
        let startDate = $('#datestartwork4').val();
        let endDate = $('#dateendtwork4').val();

        if (startDate && endDate) {
            let startDateObj = new Date(startDate);
            let endDateObj = new Date(endDate);
            if (dateObj < startDateObj || dateObj > endDateObj) {
                return;
            }
        }

        let machine = ms[1];
        let quantity = ms[2];
        let code = ms[3];

        let workRecord = worklistall.find(w => w[1] === code);
        if (workRecord) {
            let multiplier = workRecord[13];
            let calculatedValue = quantity * multiplier;
            let key = `${date}_${machine}`;
            summary[key] = (summary[key] || 0) + calculatedValue;
        }
    });

    let tableData = [];
    for (let key in summary) {
        let [date, machine] = key.split('_');
        tableData.push({ date, machine, total: summary[key] });
    }

    let tbody = document.querySelector('.shiftTable4 tbody');
    tbody.innerHTML = '';
    tableData.forEach(row => {
        let machineNumber = row.machine.replace('machine', '');
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.date}</td>
                    <td>เครื่องที่ ${machineNumber}</td>
                    <td>${row.total.toLocaleString('en-US')}</td>`;
        tbody.appendChild(tr);
    });


    let dateMachineData = {};
    tableData.forEach(item => {
        if (!dateMachineData[item.date]) {
            dateMachineData[item.date] = {};
        }
        dateMachineData[item.date][item.machine] = item.total;
    });

    let dates = Object.keys(dateMachineData).sort();
    let machineSet = new Set();
    tableData.forEach(item => {
        machineSet.add(item.machine);
    });
    let machines = Array.from(machineSet);

    let colors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    let borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    let datasets = machines.map((machine, index) => {
        let machineNumber = machine.replace('machine', '');
        let data = dates.map(date => dateMachineData[date][machine] || 0);
        return {
            label: `เครื่องที่ ${machineNumber}`,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderColor: borderColors[index % borderColors.length],
            borderWidth: 1
        };
    });


    myChart4.data.labels = dates;
    myChart4.data.datasets = datasets;
    myChart4.update();

    let totalAll = tableData.reduce((sum, row) => sum + row.total, 0);
    $('#mowork4').val(totalAll.toLocaleString('en-US'));
}

function convertToAD(timestamp) {
    let datePart = timestamp.split('T')[0];
    let parts = datePart.split('-');
    let adYear = parseInt(parts[0]) - 543;
    return `${adYear}-${parts[1]}-${parts[2]}`;
}

let $myChart5 = $('#myChart5');
let ctx5 = $myChart5[0].getContext('2d');
let myChart5 = new Chart(ctx5, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString('en-US');
                    }
                }
            }
        }
    }
});

function updateChart5() {
    let startDate = $('#datestartwork5').val();
    let endDate = $('#dateendtwork5').val();
    let summary = {};
    machinesum.forEach(ms => {
        let parts = ms[0].split('T');
        let datePart = parts[0];
        let timePart = parts[1];
        let dateParts = datePart.split('-');
        let adYear = parseInt(dateParts[0]) - 543;
        let fullTimestamp = `${adYear}-${dateParts[1]}-${dateParts[2]}T${timePart}`;
        let dateObj = new Date(fullTimestamp);

        if (dateObj.getHours() < 8) {
            dateObj.setDate(dateObj.getDate() - 1);
        }

        let hour = dateObj.getHours();
        let shift = (hour >= 8 && hour < 20) ? 'day' : 'night';

        let formattedDate =
            dateObj.getFullYear() + '-' +
            ('0' + (dateObj.getMonth() + 1)).slice(-2) + '-' +
            ('0' + dateObj.getDate()).slice(-2);

        if (startDate && endDate) {
            let startDateObj = new Date(startDate);
            let endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999);
            if (dateObj < startDateObj || dateObj > endDateObj) {
                return;
            }
        }


        let machine = ms[1];
        let quantity = ms[2];
        let code = ms[3];

        let workRecord = worklistall.find(w => w[1] === code);
        if (workRecord) {
            let multiplier = workRecord[7];
            let calculatedValue = quantity * multiplier;
            let key = `${formattedDate}_${machine}_${shift}`;
            summary[key] = (summary[key] || 0) + calculatedValue;
        }
    });

    let tableData = [];
    for (let key in summary) {
        let parts = key.split('_');
        let date = parts[0];
        let machine = parts[1];
        let shift = parts[2];
        tableData.push({ date, machine, shift, total: summary[key] });
    }

    let tbody = document.querySelector('.shiftTable5 tbody');
    tbody.innerHTML = '';
    tableData.forEach(row => {
        let machineNumber = row.machine.replace('machine', '');
        let shiftLabel = row.shift === 'day' ? 'เช้า' : 'ดึก';
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.date}</td>
                        <td>เครื่องที่ ${machineNumber} (${shiftLabel})</td>
                        <td>${row.total.toLocaleString('en-US')}</td>`;
        tbody.appendChild(tr);
    });

    let dateMachineShiftData = {};
    tableData.forEach(item => {
        if (!dateMachineShiftData[item.date]) {
            dateMachineShiftData[item.date] = {};
        }
        let machineKey = `${item.machine}_${item.shift}`;
        dateMachineShiftData[item.date][machineKey] = item.total;
    });

    let dates = Object.keys(dateMachineShiftData).sort();
    let machineShiftSet = new Set();
    tableData.forEach(item => {
        machineShiftSet.add(`${item.machine}_${item.shift}`);
    });
    let machineShiftArr = Array.from(machineShiftSet);

    let colors = [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    let borderColors = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];

    machineShiftArr.sort((a, b) => {
        let [machineA, shiftA] = a.split('_');
        let [machineB, shiftB] = b.split('_');

        let machineNumA = parseInt(machineA.replace('machine', ''));
        let machineNumB = parseInt(machineB.replace('machine', ''));

        if (machineNumA < machineNumB) return -1;
        if (machineNumA > machineNumB) return 1;

        if (shiftA === 'day' && shiftB === 'night') return -1;
        if (shiftA === 'night' && shiftB === 'day') return 1;

        return 0;
    });


    let datasets = machineShiftArr.map((machineKey, index) => {
        let [machine, shift] = machineKey.split('_');
        let machineNumber = machine.replace('machine', '');
        let shiftLabel = shift === 'day' ? 'เช้า' : 'ดึก';
        let data = dates.map(date => dateMachineShiftData[date][machineKey] || 0);

        return {
            label: `เครื่องที่ ${machineNumber} (${shiftLabel})`,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderColor: borderColors[index % borderColors.length],
            borderWidth: 1
        };
    });


    myChart5.data.labels = dates;
    myChart5.data.datasets = datasets;
    myChart5.update();

    let dayTotal = 0, nightTotal = 0;
    tableData.forEach(row => {
        if (row.shift === 'day') {
            dayTotal += row.total;
        } else if (row.shift === 'night') {
            nightTotal += row.total;
        }
    });

    $('#mowork5').val(dayTotal.toLocaleString('en-US'));
    $('#niwork5').val(nightTotal.toLocaleString('en-US'));
}