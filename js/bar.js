
function drawBar(day, loc, outlier_flag, extcomm_flag){

    switch (day) {
        case "1":
            day_data = fridata;
            break;
        case "2":
            day_data = fridata;
            break;
        case "3":
            day_data = saturdata;
            break;
        case "4":
            day_data = sundata;
            break;
        default:
            day_data = fridata;
            break;
    }

    console.log(day_data, day, loc, outlier_flag, extcomm_flag);

    var loc_;
    switch (loc) {
        case "1":
            loc_ = "Entry Corridor";
            break;
        case "2":
            loc_ = "Entry Corridor";
            break;
        case "3":
            loc_ = "Kiddie Land";
            break;
        case "4":
            loc_ = "Tundra Land";
            break;
        case "5":
            loc_ = "Wet Land";
            break;
        case "6":
            loc_ = "Coaster Alley";
            break;
        default:
            loc_ = "Entry Corridor";
            break;
    }

    // filter on extcomm flag here
    day_data.filter((d)=>{
        d.location==loc_;
    })

    var to_freq = {}
    var from_freq = {}
    for (obj in day_data){
        if (obj.to in to_freq){
            to_freq[obj.to]+=1
        }
        else{
            to_freq[obj.to]=1
        }

        if (obj.from in to_freq){
            to_freq[obj.from]+=1
        }
        else{
            to_freq[obj.from]=1
        }
    }

    var to_data = day_data.sort((a,b)=>{return to_freq[b.to]-to_freq[a.to]})
    var from_data = day_data.sort((a,b)=>{return from_freq[b.from]-from_freq[a.from]})

    // console.log(to_data)
    // console.log(from_data)

    
}