
class Sample {
  constructor(data) {
    this.idsamples = data.idsamples || -1
    this.name = data.name
    this.categoryindex = data.categoryindex || 99
    this.category = data.category || '自定义'
    this.samplingtime = data.samplingtime
    this.longitude = data.longitude
    this.latitude = data.latitude
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
      longitude: this.longitude,
      latitude: this.latitude,
      stateindex: this.stateindex,
      state: this.state,
      locationofstorage: this.locationofstorage,
      comment: this.comment
    }
  }

}

module.exports = Sample