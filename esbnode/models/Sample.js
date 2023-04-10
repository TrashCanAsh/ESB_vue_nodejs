
class Sample {
  constructor(data) {
    this.idsamples = data.idsamples || -1
    this.name = data.name
    this.categoryindex = data.categoryindex || 99
    this.category = data.category || '自定义'
    this.samplingtime = data.samplingtime
    this.samplinglocation = data.samplinglocation || '未知地点'
    this.longitude = data.longitude
    this.latitude = data.latitude
    this.wetweight = data.wetweight || 0
    this.dryweight = data.dryweight || 0
    this.stateindex = data.stateindex || 1
    this.state = data.state || '在库'
    this.locationofstorage = data.locationofstorage || '暂无'
    this.comment = data.comment
  }

  toDb() {
    return{
      idsamples: this.idsamples,
      name: this.name,
      categoryindex: this.categoryindex,
      category: this.category,
      samplingtime: this.samplingtime,
      samplinglocation: this.samplinglocation,
      longitude: this.longitude,
      latitude: this.latitude,
      wetweight: this.wetweight,
      dryweight: this.dryweight,
      stateindex: this.stateindex,
      state: this.state,
      locationofstorage: this.locationofstorage,
      comment: this.comment
    }
  }

}

module.exports = Sample